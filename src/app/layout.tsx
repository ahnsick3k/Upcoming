import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Upcoming — 내 일정 카운트다운',
  description: '오늘부터 각 일정이 얼마나 남았는지 한눈에 확인하세요.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${montserrat.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ background: 'var(--color-canvas)' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
