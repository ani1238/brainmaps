-- Widen supported grade range from 3-7 to 3-9 (ICSE Class 9 Chemistry pilot),
-- and register the new subject row so chapters.subject_key can reference it.

ALTER TABLE students DROP CONSTRAINT students_grade_check;
ALTER TABLE students ADD CONSTRAINT students_grade_check CHECK (grade BETWEEN 3 AND 9);

ALTER TABLE users DROP CONSTRAINT users_grade_check;
ALTER TABLE users ADD CONSTRAINT users_grade_check CHECK (grade BETWEEN 3 AND 9);

INSERT INTO subjects (key, display_name, board, grade, order_idx)
VALUES ('chemistry', 'Chemistry', 'ICSE', 9, 1)
ON CONFLICT (key) DO NOTHING;
