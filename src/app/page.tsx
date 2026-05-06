'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { DayEvent, ScheduleEvent } from '@/types';
import { enrichEvent, sortByDday } from '@/lib/dday';
import EventCard from '@/components/EventCard';
import EventModal from '@/components/EventModal';
import AppleConnectModal from '@/components/AppleConnectModal';
import {
  PlusIcon,
  ArrowPathIcon,
  CalendarIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type FilterTab = 'all' | 'upcoming' | 'today' | 'past';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<DayEvent[]>([]);
  const [filter, setFilter] = useState<FilterTab>('upcoming');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEvent, setEditEvent] = useState<DayEvent | null>(null);
  const [showApple, setShowApple] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      const enriched = (data.events as ScheduleEvent[]).map(enrichEvent);
      setEvents(sortByDday(enriched));
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated') fetchEvents();
  }, [status, fetchEvents]);

  async function syncGoogle() {
    setSyncing(true);
    await fetch('/api/calendars/google', { method: 'POST' });
    await fetchEvents();
    setSyncing(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('이 일정을 삭제할까요?')) return;
    await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
    fetchEvents();
  }

  const filteredEvents = events.filter((e) => {
    if (filter === 'upcoming') return e.daysLeft >= 1;
    if (filter === 'today') return e.daysLeft === 0;
    if (filter === 'past') return e.daysLeft < 0;
    return true;
  });

  const todayCount = events.filter((e) => e.daysLeft === 0).length;
  const upcomingCount = events.filter((e) => e.daysLeft >= 1).length;

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--color-canvas)' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div className="flex items-center justify-center mb-6">
            <CalendarIcon className="w-12 h-12" style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 500, color: 'var(--color-ink-deep)', lineHeight: 1.16, marginBottom: 12 }}>
            Upcoming
          </h1>
          <p style={{ fontSize: 18, color: 'var(--color-slate)', lineHeight: 1.44, marginBottom: 40 }}>
            오늘부터 각 일정까지 남은 날을<br />한눈에 확인하세요.
          </p>
          <button onClick={() => signIn('google')} className="btn-buy" style={{ width: '100%', maxWidth: 280 }}>
            Google로 시작하기
          </button>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ArrowPathIcon className="w-8 h-8 animate-spin" style={{ color: 'var(--color-stone)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-soft)' }}>
      {/* Top Nav */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8"
        style={{ background: 'var(--color-canvas)', borderBottom: '1px solid var(--color-hairline-soft)', height: 64 }}
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-ink-deep)' }}>Upcoming</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button onClick={syncGoogle} disabled={syncing} className="btn-ghost flex items-center gap-1.5" style={{ padding: '8px 14px', fontSize: 13 }}>
            <ArrowPathIcon className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /> Google 동기화
          </button>
          <button onClick={() => setShowApple(true)} className="btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
            Apple 연동
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-1.5" style={{ padding: '10px 18px', fontSize: 13 }}>
            <PlusIcon className="w-4 h-4" /> 일정 추가
          </button>
          <button onClick={() => signOut()} title="로그아웃"
            style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-hairline)', cursor: 'pointer', background: 'none', padding: 0 }}>
            {session?.user?.image
              ? <img src={session.user.image} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-slate)' }}>{session?.user?.name?.[0] ?? '?'}</span>
            }
          </button>
        </div>
        <button className="sm:hidden p-2" onClick={() => setMenuOpen(v => !v)}>
          {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="sm:hidden fixed inset-0 z-30 pt-16" style={{ background: 'rgba(10,19,23,0.4)' }} onClick={() => setMenuOpen(false)}>
          <div className="flex flex-col gap-2 p-4" style={{ background: 'var(--color-canvas)', borderBottom: '1px solid var(--color-hairline-soft)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { syncGoogle(); setMenuOpen(false); }} className="btn-ghost" style={{ justifyContent: 'flex-start', gap: 8 }}>
              <ArrowPathIcon className="w-4 h-4" /> Google 동기화
            </button>
            <button onClick={() => { setShowApple(true); setMenuOpen(false); }} className="btn-ghost" style={{ justifyContent: 'flex-start', gap: 8 }}>
              <CalendarIcon className="w-4 h-4" /> Apple 연동
            </button>
            <button onClick={() => { setShowAddModal(true); setMenuOpen(false); }} className="btn-primary" style={{ justifyContent: 'flex-start', gap: 8 }}>
              <PlusIcon className="w-4 h-4" /> 일정 추가
            </button>
            <button onClick={() => signOut()} className="btn-secondary" style={{ justifyContent: 'flex-start', gap: 8 }}>로그아웃</button>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card-sm flex flex-col gap-1">
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: 0.5 }}>오늘</span>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-ink-deep)' }}>{todayCount}</span>
            <span style={{ fontSize: 13, color: 'var(--color-steel)' }}>개의 일정</span>
          </div>
          <div className="card-sm flex flex-col gap-1">
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: 0.5 }}>예정</span>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-primary)' }}>{upcomingCount}</span>
            <span style={{ fontSize: 13, color: 'var(--color-steel)' }}>개의 일정</span>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {([
            { key: 'upcoming', label: '예정' },
            { key: 'today',    label: '오늘' },
            { key: 'all',      label: '전체' },
            { key: 'past',     label: '지난' },
          ] as const).map(({ key, label }) => (
            <button key={key} className={`pill-tab ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <ArrowPathIcon className="w-8 h-8 animate-spin" style={{ color: 'var(--color-stone)' }} />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="card flex flex-col items-center py-16 gap-4" style={{ textAlign: 'center' }}>
            <CalendarIcon className="w-12 h-12" style={{ color: 'var(--color-stone)' }} />
            <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-slate)' }}>일정이 없습니다</p>
            <p style={{ fontSize: 14, color: 'var(--color-steel)' }}>+ 일정 추가 버튼을 눌러 새 일정을 만들거나<br />Google / Apple 캘린더를 동기화해보세요.</p>
            <button onClick={() => setShowAddModal(true)} className="btn-buy" style={{ marginTop: 8 }}>
              <PlusIcon className="w-4 h-4" /> 일정 추가
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} onEdit={setEditEvent} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      <button className="sm:hidden fixed bottom-6 right-6 z-30 flex items-center justify-center w-14 h-14 btn-buy shadow-lg"
        style={{ borderRadius: '50%', padding: 0 }} onClick={() => setShowAddModal(true)}>
        <PlusIcon className="w-6 h-6" />
      </button>

      {showAddModal && <EventModal onClose={() => setShowAddModal(false)} onSaved={fetchEvents} />}
      {editEvent && <EventModal event={editEvent} onClose={() => setEditEvent(null)} onSaved={fetchEvents} />}
      {showApple && <AppleConnectModal onClose={() => setShowApple(false)} onSynced={fetchEvents} />}
    </div>
  );
}
