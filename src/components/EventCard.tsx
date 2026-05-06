'use client';

import { DayEvent } from '@/types';
import { getBadgeClass } from '@/lib/dday';
import {
  MapPinIcon,
  TrashIcon,
  PencilIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

interface Props {
  event: DayEvent;
  onEdit: (event: DayEvent) => void;
  onDelete: (id: string) => void;
}

const SOURCE_LABEL: Record<string, { label: string; color: string }> = {
  google: { label: 'Google', color: '#EA4335' },
  apple:  { label: 'Apple',  color: '#555555' },
  manual: { label: '직접 추가', color: '#0866FF' },
};

export default function EventCard({ event, onEdit, onDelete }: Props) {
  const src = SOURCE_LABEL[event.source] ?? SOURCE_LABEL.manual;

  return (
    <div className="card-sm flex items-start gap-4 group">
      {/* D-day badge column */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 pt-1">
        <span className={getBadgeClass(event.daysLeft)} style={{ fontSize: 11 }}>
          {event.dLabel}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {/* Source dot */}
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: src.color }}
            title={src.label}
          />
          <p
            className="font-bold truncate"
            style={{ fontSize: 16, color: 'var(--color-ink-deep)', lineHeight: 1.5 }}
          >
            {event.title}
          </p>
        </div>

        <div className="flex items-center gap-1" style={{ color: 'var(--color-slate)', fontSize: 13 }}>
          <CalendarDaysIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{event.date}{event.end_date && event.end_date !== event.date ? ` ~ ${event.end_date}` : ''}</span>
        </div>

        {event.location && (
          <div className="flex items-center gap-1 mt-0.5" style={{ color: 'var(--color-steel)', fontSize: 13 }}>
            <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {event.description && (
          <p
            className="mt-1 line-clamp-2"
            style={{ fontSize: 13, color: 'var(--color-charcoal)', lineHeight: 1.43 }}
          >
            {event.description}
          </p>
        )}
      </div>

      {/* Actions — show on hover */}
      {event.source === 'manual' && (
        <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(event)}
            className="p-2 rounded-full"
            style={{ color: 'var(--color-slate)' }}
            title="편집"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="p-2 rounded-full"
            style={{ color: 'var(--color-critical)' }}
            title="삭제"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
