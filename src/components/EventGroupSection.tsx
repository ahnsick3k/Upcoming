'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { DayEvent } from '@/types';
import EventCard from './EventCard';

interface Props {
  label: string;
  dotColor: string;
  pillBg: string;
  events: DayEvent[];
  defaultOpen: boolean;
  /** 접힌 상태에서 첫 번째 항목만 표시 (파란색 그룹) */
  showFirstOnly?: boolean;
  onEdit: (event: DayEvent) => void;
  onDelete: (id: string) => void;
}

export default function EventGroupSection({
  label,
  dotColor,
  pillBg,
  events,
  defaultOpen,
  showFirstOnly = false,
  onEdit,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  if (events.length === 0) return null;

  const shownEvents = open ? events : showFirstOnly ? events.slice(0, 1) : [];
  const hiddenCount = events.length - 1;

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Group header */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '8px 4px',
          background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <span
          style={{
            display: 'inline-block', width: 10, height: 10,
            borderRadius: '50%', background: dotColor, flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink-deep)' }}>
          {label}
        </span>
        <span
          style={{
            fontSize: 11, fontWeight: 700, color: dotColor,
            background: pillBg, borderRadius: 100, padding: '2px 8px',
          }}
        >
          {events.length}
        </span>
        <ChevronDownIcon
          style={{
            width: 16, height: 16,
            color: 'var(--color-slate)',
            marginLeft: 'auto',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease-out',
          }}
        />
      </button>

      {/* Event cards */}
      {shownEvents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 4 }}>
          {shownEvents.map((event) => (
            <EventCard key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}

      {/* 더 보기 — 파란색 그룹 전용 */}
      {showFirstOnly && !open && hiddenCount > 0 && (
        <button
          onClick={() => setOpen(true)}
          style={{
            fontSize: 13, fontWeight: 700, color: dotColor,
            background: 'none', border: 'none', cursor: 'pointer',
            paddingLeft: 22, paddingBottom: 8, display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          +{hiddenCount}개 더 보기
          <ChevronDownIcon style={{ width: 14, height: 14 }} />
        </button>
      )}
    </div>
  );
}
