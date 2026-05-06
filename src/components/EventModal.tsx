'use client';

import { useState } from 'react';
import { DayEvent } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  event?: DayEvent | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EventModal({ event, onClose, onSaved }: Props) {
  const isEdit = !!event;
  const [title, setTitle] = useState(event?.title ?? '');
  const [date, setDate] = useState(event?.date ?? '');
  const [endDate, setEndDate] = useState(event?.end_date ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [location, setLocation] = useState(event?.location ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setLoading(true);
    setError('');

    try {
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch('/api/events', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEdit ? { id: event.id } : {}),
          title: title.trim(),
          date,
          end_date: endDate || null,
          description: description || null,
          location: location || null,
          all_day: true,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? '저장 실패');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(10,19,23,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card w-full max-w-md" style={{ padding: 'var(--spacing-xxl)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontSize: 24, fontWeight: 500, color: 'var(--color-ink-deep)' }}>
            {isEdit ? '일정 수정' : '새 일정'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full" style={{ color: 'var(--color-slate)' }}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-charcoal)' }}>
              제목 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목을 입력하세요"
              required
              style={{
                marginTop: 6,
                width: '100%',
                height: 44,
                padding: '0 12px',
                borderRadius: 'var(--rounded-lg)',
                border: '1px solid var(--color-hairline)',
                fontSize: 16,
                color: 'var(--color-ink)',
                outline: 'none',
                background: 'var(--color-canvas)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-fb-blue)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-hairline)')}
            />
          </div>

          {/* Date row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-charcoal)' }}>
                날짜 *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{
                  marginTop: 6,
                  width: '100%',
                  height: 44,
                  padding: '0 12px',
                  borderRadius: 'var(--rounded-lg)',
                  border: '1px solid var(--color-hairline)',
                  fontSize: 14,
                  color: 'var(--color-ink)',
                  outline: 'none',
                  background: 'var(--color-canvas)',
                }}
              />
            </div>
            <div className="flex-1">
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-charcoal)' }}>
                종료일 (선택)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={date}
                style={{
                  marginTop: 6,
                  width: '100%',
                  height: 44,
                  padding: '0 12px',
                  borderRadius: 'var(--rounded-lg)',
                  border: '1px solid var(--color-hairline)',
                  fontSize: 14,
                  color: 'var(--color-ink)',
                  outline: 'none',
                  background: 'var(--color-canvas)',
                }}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-charcoal)' }}>
              장소 (선택)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="장소를 입력하세요"
              style={{
                marginTop: 6,
                width: '100%',
                height: 44,
                padding: '0 12px',
                borderRadius: 'var(--rounded-lg)',
                border: '1px solid var(--color-hairline)',
                fontSize: 14,
                color: 'var(--color-ink)',
                outline: 'none',
                background: 'var(--color-canvas)',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-charcoal)' }}>
              메모 (선택)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="메모를 입력하세요"
              rows={3}
              style={{
                marginTop: 6,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--rounded-lg)',
                border: '1px solid var(--color-hairline)',
                fontSize: 14,
                color: 'var(--color-ink)',
                outline: 'none',
                background: 'var(--color-canvas)',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: 'var(--color-critical)' }}>{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              취소
            </button>
            <button type="submit" className="btn-buy flex-1" disabled={loading}>
              {loading ? '저장 중…' : isEdit ? '수정하기' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
