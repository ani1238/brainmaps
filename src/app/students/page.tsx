'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GridBackground } from '@/components/GridBackground';
import {
  getHouseholdStudents,
  addStudentToHousehold,
  type ApiHouseholdStudent,
} from '@/lib/api';
import { saveProfile, getAuthToken } from '@/lib/storage';

const GRADES = [3, 4, 5, 6, 7] as const;

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<ApiHouseholdStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Add-student form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<number>(6);
  const [board, setBoard] = useState<'CBSE' | 'ICSE'>('CBSE');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace('/');
      return;
    }
    getHouseholdStudents()
      .then(list => {
        setStudents(list);
        setShowForm(list.length === 0); // auto-open form if no students yet
      })
      .catch(() => router.replace('/'))
      .finally(() => setLoadingStudents(false));
  }, [router]);

  function selectStudent(s: ApiHouseholdStudent) {
    saveProfile({
      id: s.id,
      name: s.name,
      class: s.grade as 3 | 4 | 5 | 6 | 7,
      board: s.board,
      streak: 0,
      lastActiveDate: '',
      enrolledSubjects: ['sci', 'soc', 'eng'],
      onboardingComplete: true,
    });
    router.push('/dashboard');
  }

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    setFormError('');
    try {
      const student = await addStudentToHousehold(name.trim(), grade, board);
      setStudents(prev => [...prev, student]);
      setName('');
      setShowForm(false);
      selectStudent(student);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not add student.');
    } finally {
      setSaving(false);
    }
  }

  const cardBase = {
    background: 'rgba(255,255,255,0.78)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.8)',
    boxShadow: '0 40px 100px rgba(79,70,229,0.12), 0 8px 24px rgba(0,0,0,0.06)',
  };

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: '#F4EFE5' }}>
      <GridBackground />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-20 blur-[140px]"
          style={{ width: 700, height: 700, background: '#4F46E5', left: '20%', top: '-15%' }} />
      </div>

      <header className="relative flex items-center gap-3 px-10 pt-8">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="rgba(79,70,229,0.1)" />
          <circle cx="20" cy="20" r="18" fill="none" stroke="#4F46E5" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="8"  fill="none" stroke="#4F46E5" strokeWidth="1.2" />
        </svg>
        <div>
          <div className="font-extrabold text-2xl leading-none" style={{ color: '#1c1917' }}>BrainMaps</div>
          <div className="text-[11px] font-mono tracking-wider mt-0.5" style={{ color: '#78716c' }}>
            premium learning · classes 3–7
          </div>
        </div>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg flex flex-col gap-4">

          {/* Heading */}
          <div className="text-[10px] font-bold tracking-widest" style={{ color: '#78716c' }}>
            WHO&apos;S LEARNING TODAY
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#1c1917' }}>
            Choose a learner.
          </h1>

          {/* Student list */}
          {loadingStudents ? (
            <p className="text-sm" style={{ color: '#78716c' }}>Loading…</p>
          ) : (
            students.map(s => (
              <button
                key={s.id}
                onClick={() => selectStudent(s)}
                className="w-full rounded-2xl p-5 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={cardBase}
              >
                <div className="font-extrabold text-lg" style={{ color: '#1c1917' }}>{s.name}</div>
                <div className="text-xs mt-1" style={{ color: '#78716c' }}>
                  Class {s.grade} · {s.board}
                </div>
              </button>
            ))
          )}

          {/* Add student button / form */}
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full rounded-2xl p-4 text-sm font-bold border-2 border-dashed transition-all hover:border-indigo-400 hover:text-indigo-600"
              style={{ borderColor: 'rgba(79,70,229,0.3)', color: '#4F46E5', background: 'transparent' }}
            >
              + Add another child
            </button>
          ) : (
            <form
              onSubmit={handleAddStudent}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={cardBase}
            >
              <div className="text-[10px] font-bold tracking-widest" style={{ color: '#78716c' }}>
                ADD A CHILD
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest mb-1.5" style={{ color: '#78716c' }}>
                  CHILD&apos;S NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Aarav"
                  className="w-full px-4 py-3 rounded-xl text-base font-semibold outline-none transition-all"
                  style={{
                    background: '#fff',
                    border: `1.5px solid ${name.length >= 2 ? '#4F46E5' : 'rgba(0,0,0,0.12)'}`,
                    color: '#1c1917',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold tracking-widest mb-1.5" style={{ color: '#78716c' }}>
                    CLASS
                  </label>
                  <select
                    value={grade}
                    onChange={e => setGrade(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl text-base font-semibold outline-none"
                    style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.12)', color: '#1c1917', fontFamily: 'inherit' }}
                  >
                    {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold tracking-widest mb-1.5" style={{ color: '#78716c' }}>
                    BOARD
                  </label>
                  <select
                    value={board}
                    onChange={e => setBoard(e.target.value as 'CBSE' | 'ICSE')}
                    className="w-full px-4 py-3 rounded-xl text-base font-semibold outline-none"
                    style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.12)', color: '#1c1917', fontFamily: 'inherit' }}
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                  </select>
                </div>
              </div>

              {formError && <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>{formError}</p>}

              <div className="flex justify-between items-center pt-1">
                {students.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-[11px] font-mono hover:underline"
                    style={{ color: '#78716c' }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={name.trim().length < 2 || saving}
                  className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, #4F46E5, #6366f1)',
                    boxShadow: '0 4px 20px rgba(79,70,229,0.35)',
                  }}
                >
                  {saving ? 'Adding…' : 'Add & start →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <footer className="relative flex justify-center pb-8">
        <div className="text-[11px] font-mono" style={{ color: '#a8a29e' }}>
          BrainMaps · Assessment engine for CBSE & ICSE
        </div>
      </footer>
    </div>
  );
}
