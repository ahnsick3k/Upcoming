'use client';

import { useState } from 'react';
import { XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  onClose: () => void;
  onSynced: () => void;
}

export default function AppleConnectModal({ onClose, onSynced }: Props) {
  const [username, setUsername] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/calendars/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, appPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '연결 실패');
      onSynced();
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
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-ink-deep)' }}>
            Apple Calendar 연동
          </h2>
          <button onClick={onClose} className="p-2 rounded-full" style={{ color: 'var(--color-slate)' }}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Info box */}
        <div
          className="flex gap-3 p-4 mb-5 rounded-xl"
          style={{ background: 'var(--color-primary-soft)' }}
        >
          <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
          <div style={{ fontSize: 13, color: 'var(--color-charcoal)', lineHeight: 1.5 }}>
            <p className="font-bold mb-1" style={{ color: 'var(--color-ink-deep)' }}>앱 전용 비밀번호가 필요합니다</p>
            <p>
              Apple ID 계정 페이지 → 보안 → 앱 전용 암호에서 발급받으세요.{' '}
              <a
                href="https://support.apple.com/ko-kr/102654"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-primary)', fontWeight: 700 }}
              >
                방법 보기 →
              </a>
            </p>
          </div>
        </div>

        <form onSubmit={handleConnect} className="flex flex-col gap-4">
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-charcoal)' }}>
              Apple ID (이메일)
            </label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="example@icloud.com"
              required
              style={{
                marginTop: 6, width: '100%', height: 44, padding: '0 12px',
                borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)',
                fontSize: 14, color: 'var(--color-ink)', outline: 'none', background: 'var(--color-canvas)',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-charcoal)' }}>
              앱 전용 비밀번호
            </label>
            <input
              type="password"
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
              placeholder="xxxx-xxxx-xxxx-xxxx"
              required
              style={{
                marginTop: 6, width: '100%', height: 44, padding: '0 12px',
                borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)',
                fontSize: 14, color: 'var(--color-ink)', outline: 'none', background: 'var(--color-canvas)',
              }}
            />
          </div>

          {error && <p style={{ fontSize: 13, color: 'var(--color-critical)' }}>{error}</p>}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">취소</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? '연결 중…' : '연결하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
