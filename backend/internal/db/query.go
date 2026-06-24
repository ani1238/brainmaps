package db

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// Querier is the subset of pgx used across the app. Both *pgxpool.Pool and
// pgx.Tx satisfy it, so handlers can run either directly on the pool or inside a
// request-scoped transaction (used to set the RLS identity).
type Querier interface {
	Query(context.Context, string, ...any) (pgx.Rows, error)
	QueryRow(context.Context, string, ...any) pgx.Row
	Exec(context.Context, string, ...any) (pgconn.CommandTag, error)
	Begin(context.Context) (pgx.Tx, error)
}

type querierKey struct{}

// WithQuerier returns a context carrying q (a request/job transaction). Calls to
// db.Query/QueryRow/Exec/Begin made with that context run on q.
func WithQuerier(ctx context.Context, q Querier) context.Context {
	return context.WithValue(ctx, querierKey{}, q)
}

// Q returns the request-scoped querier if one was installed via WithQuerier,
// otherwise the shared pool. Always prefer db.Query/QueryRow/Exec/Begin.
func Q(ctx context.Context) Querier {
	if q, ok := ctx.Value(querierKey{}).(Querier); ok && q != nil {
		return q
	}
	return Pool
}

// Package-level helpers route every query through the context querier so the
// per-request RLS identity (set via SET LOCAL app.student_id) is honoured.
func Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error) {
	return Q(ctx).Query(ctx, sql, args...)
}
func QueryRow(ctx context.Context, sql string, args ...any) pgx.Row {
	return Q(ctx).QueryRow(ctx, sql, args...)
}
func Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error) {
	return Q(ctx).Exec(ctx, sql, args...)
}
func Begin(ctx context.Context) (pgx.Tx, error) {
	return Q(ctx).Begin(ctx)
}

// RunAsStudent runs fn inside a transaction whose RLS identity is studentID, so
// background jobs (the async grader, MCQ recompute) can touch a student's rows.
// The transaction is short-lived — callers must keep slow work (e.g. AI calls)
// outside fn so a pool connection isn't held across it.
func RunAsStudent(ctx context.Context, studentID string, fn func(ctx context.Context) error) error {
	conn, err := Pool.Acquire(ctx)
	if err != nil {
		return err
	}
	defer conn.Release()
	tx, err := conn.Begin(ctx)
	if err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, "SELECT set_config('app.student_id', $1, true)", studentID); err != nil {
		tx.Rollback(ctx)
		return err
	}
	if err := fn(WithQuerier(ctx, tx)); err != nil {
		tx.Rollback(ctx)
		return err
	}
	return tx.Commit(ctx)
}
