'use client';

import { useState } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay,
  addMonths, subMonths, addWeeks, subWeeks, isToday, parseISO, startOfDay,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { DayEvent } from '@/types';

interface Props {
  events: DayEvent[];
  onEdit: (event: DayEvent) => void;
}

type CalMode = 'week' | 'month';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const DAY_COLOR = (i: number) =>
  i === 0 ? 'var(--color-critical)' : i === 6 ? 'var(--color-primary)' : 'var(--color-slate)';

const EVENT_STYLE = (source: string) =>
  source === 'google'
    ? { bg: '#FEE2E2', color: '#C0392B' }
    : source === 'apple'
    ? { bg: '#F3F4F6', color: '#555555' }
    : { bg: 'var(--color-primary-soft)', color: 'var(--color-primary)' };

export default function CalendarView({ events, onEdit }: Props) {
  const [mode, setMode] = useState<CalMode>('month');
  const [current, setCurrent] = useState(new Date());

  function getEventsForDay(day: Date): DayEvent[] {
    return events.filter((e) => isSameDay(startOfDay(parseISO(e.date)), day));
  }

  function prev() {
    setCurrent(mode === 'month' ? subMonths(current, 1) : subWeeks(current, 1));
  }
  function next() {
    setCurrent(mode === 'month' ? addMonths(current, 1) : addWeeks(current, 1));
  }
  function goToday() {
    setCurrent(new Date());
  }

  const wStart = startOfWeek(current, { weekStartsOn: 0 });
  const wEnd = endOfWeek(current, { weekStartsOn: 0 });
  const titleText =
    mode === 'month'
      ? format(current, 'yyyy년 M월', { locale: ko })
      : `${format(wStart, 'M월 d일')} – ${format(wEnd, 'M월 d일')}`;

  /* ──────────────────────────────── Month ── */
  function renderMonth() {
    const days = eachDayOfInterval({
      start: startOfWeek(startOfMonth(current), { weekStartsOn: 0 }),
      end: endOfWeek(endOfMonth(current), { weekStartsOn: 0 }),
    });

    return (
      <>
        {/* Day-of-week header */}
        <div className="grid grid-cols-7">
          {DAY_LABELS.map((d, i) => (
            <div
              key={d}
              className="text-center py-2"
              style={{ fontSize: 11, fontWeight: 700, color: DAY_COLOR(i) }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div
          className="grid grid-cols-7"
          style={{ borderTop: '1px solid var(--color-hairline-soft)', borderLeft: '1px solid var(--color-hairline-soft)' }}
        >
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const inMonth = isSameMonth(day, current);
            const today = isToday(day);
            const dow = day.getDay();

            return (
              <div
                key={day.toISOString()}
                style={{
                  borderRight: '1px solid var(--color-hairline-soft)',
                  borderBottom: '1px solid var(--color-hairline-soft)',
                  minHeight: 80,
                  padding: '6px 4px 4px',
                  opacity: inMonth ? 1 : 0.38,
                  background: today ? 'rgba(8,102,255,0.03)' : 'var(--color-canvas)',
                }}
              >
                {/* Day number */}
                <div className="flex justify-center mb-1">
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 24, height: 24, borderRadius: '50%',
                      fontSize: 12, fontWeight: today ? 700 : 400,
                      background: today ? 'var(--color-ink-deep)' : 'transparent',
                      color: today ? '#fff' : dow === 0 ? 'var(--color-critical)' : dow === 6 ? 'var(--color-primary)' : 'var(--color-ink-deep)',
                    }}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Events */}
                <div className="flex flex-col gap-0.5">
                  {dayEvents.slice(0, 3).map((e) => {
                    const s = EVENT_STYLE(e.source);
                    return (
                      <div
                        key={e.id}
                        onClick={() => e.source === 'manual' && onEdit(e)}
                        style={{
                          fontSize: 10, fontWeight: 600,
                          padding: '1px 4px', borderRadius: 3,
                          background: s.bg, color: s.color,
                          cursor: e.source === 'manual' ? 'pointer' : 'default',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <span style={{ fontSize: 9, color: 'var(--color-slate)', paddingLeft: 4 }}>
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  /* ──────────────────────────────── Week ── */
  function renderWeek() {
    const days = eachDayOfInterval({ start: wStart, end: wEnd });

    return (
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const today = isToday(day);
          const dow = day.getDay();

          return (
            <div key={day.toISOString()} style={{ minHeight: 160 }}>
              {/* Day header */}
              <div
                className="flex flex-col items-center pb-2 mb-2"
                style={{ borderBottom: '2px solid', borderColor: today ? 'var(--color-ink-deep)' : 'var(--color-hairline-soft)' }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: DAY_COLOR(dow) }}>
                  {DAY_LABELS[dow]}
                </span>
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 30, height: 30, borderRadius: '50%', marginTop: 2,
                    fontSize: 14, fontWeight: today ? 700 : 500,
                    background: today ? 'var(--color-ink-deep)' : 'transparent',
                    color: today ? '#fff' : 'var(--color-ink-deep)',
                  }}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Events */}
              <div className="flex flex-col gap-1">
                {dayEvents.length === 0 && (
                  <div style={{ height: 2, borderRadius: 1, background: 'var(--color-hairline-soft)', margin: '4px 6px' }} />
                )}
                {dayEvents.map((e) => {
                  const s = EVENT_STYLE(e.source);
                  return (
                    <div
                      key={e.id}
                      onClick={() => e.source === 'manual' && onEdit(e)}
                      style={{
                        padding: '5px 6px', borderRadius: 6,
                        background: s.bg,
                        cursor: e.source === 'manual' ? 'pointer' : 'default',
                      }}
                    >
                      <p style={{
                        fontSize: 11, fontWeight: 700, color: s.color,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {e.title}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--color-slate)', marginTop: 1 }}>
                        {e.dLabel}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      {/* Calendar toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        {/* Week / Month toggle */}
        <div className="flex gap-1">
          {(['week', 'month'] as const).map((m) => (
            <button
              key={m}
              className={`pill-tab${mode === m ? ' active' : ''}`}
              style={{ padding: '6px 14px', fontSize: 13 }}
              onClick={() => setMode(m)}
            >
              {m === 'week' ? '주간' : '월간'}
            </button>
          ))}
        </div>

        {/* Period nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="pill-tab"
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            오늘
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink-deep)' }}>
            {titleText}
          </span>
          <div className="flex gap-1">
            <button
              onClick={prev}
              className="p-1.5"
              style={{ border: '1px solid var(--color-hairline)', borderRadius: 6, color: 'var(--color-slate)' }}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="p-1.5"
              style={{ border: '1px solid var(--color-hairline)', borderRadius: 6, color: 'var(--color-slate)' }}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar body */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px', overflowX: 'auto' }}>
          {mode === 'month' ? renderMonth() : renderWeek()}
        </div>
      </div>
    </div>
  );
}
