# Upcoming — 작업 진행 상황

_마지막 저장: 2026-05-06 — **전체 완료 ✅**_

## 배포 URL
- **로컬**: http://localhost:3000
- **GitHub**: https://github.com/ahnsick3k/Upcoming
- **Vercel**: https://upcoming-beta.vercel.app

---

## 프로젝트 개요

- **앱 이름**: Upcoming
- **컨셉**: 오늘 기준 각 일정의 D-day 카운트다운 (D-3, D-DAY, D+2)
- **경로**: `LLM/Schedule/upcoming/`
- **GitHub 저장소**: `ahnsick3k/Upcoming` (아직 미생성)
- **Supabase URL**: `https://tkrnkqyhmphagzhuezvj.supabase.co`

---

## ✅ 완료된 작업

### 프로젝트 초기화
- [x] `create-next-app` (Next.js 15, TypeScript, Tailwind v4, App Router, src/)
- [x] 의존성 설치: `next-auth@beta`, `@supabase/supabase-js`, `googleapis`, `tsdav`, `node-ical`, `@heroicons/react`, `date-fns`

### 디자인 시스템 (`globals.css`)
- [x] Meta 디자인 토큰 전체 정의 (colors, spacing, border-radius)
- [x] 유틸리티 클래스: `btn-primary`, `btn-buy`, `btn-secondary`, `btn-ghost`, `pill-tab`, `card`, `card-sm`, `badge` 시리즈
- [x] Montserrat 폰트 적용 (Google Fonts)

### 타입 정의 (`src/types/index.ts`)
- [x] `ScheduleEvent`, `ConnectedCalendar`, `DayEvent` 인터페이스

### 유틸 함수 (`src/lib/`)
- [x] `dday.ts` — D-day 계산, 정렬, 뱃지 색상
- [x] `supabase.ts` — Supabase 클라이언트
- [x] `auth.ts` — NextAuth Google OAuth (calendar.readonly 스코프 포함)

### API 라우트 (`src/app/api/`)
- [x] `auth/[...nextauth]/route.ts` — NextAuth 핸들러
- [x] `events/route.ts` — GET / POST / PATCH / DELETE (manual 이벤트 CRUD)
- [x] `calendars/google/route.ts` — Google Calendar 동기화 (3개월 전 ~ 1년 후)
- [x] `calendars/apple/route.ts` — Apple CalDAV 연동 (tsdav, iCloud)

### UI 컴포넌트 (`src/components/`)
- [x] `EventCard.tsx` — D-day 뱃지 + 소스 표시 + 편집/삭제
- [x] `EventModal.tsx` — 새 일정 추가 / 수정 모달
- [x] `AppleConnectModal.tsx` — Apple ID + 앱 전용 비밀번호 입력 모달

### 페이지
- [x] `layout.tsx` — Montserrat 폰트, 메타데이터
- [x] `page.tsx` — 메인 홈 (로그인 화면 + 앱 본체: 필터탭, 이벤트 목록, 요약 카드, FAB)

---

## ❌ 남은 작업 (이어서 할 것)

### 1. 환경변수 파일 생성 `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://tkrnkqyhmphagzhuezvj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_wgR7frg3Kib-5P59QzRGkA_qZXJmAkf
SUPABASE_SERVICE_ROLE_KEY=<Supabase → Settings → API → service_role key>
AUTH_SECRET=<랜덤 문자열, 터미널에서 openssl rand -base64 32>
AUTH_GOOGLE_ID=<Google Cloud Console → OAuth 2.0 Client ID>
AUTH_GOOGLE_SECRET=<Google Cloud Console → OAuth 2.0 Client Secret>
AUTH_URL=http://localhost:3000
```

### 2. NextAuth SessionProvider 래핑
- `src/app/providers.tsx` 파일 생성 (SessionProvider)
- `layout.tsx`에서 providers로 감싸기

### 3. Supabase DB 스키마 실행
Supabase 대시보드 → SQL Editor에서 아래 SQL 실행:

```sql
-- events 테이블
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  location TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  external_id TEXT,
  all_day BOOLEAN DEFAULT true,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, external_id)
);

-- connected_calendars 테이블
CREATE TABLE connected_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  name TEXT,
  apple_username TEXT,
  apple_app_password TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- RLS 비활성화 (서버사이드에서만 접근하므로)
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE connected_calendars DISABLE ROW LEVEL SECURITY;
```

### 4. Google Cloud Console 설정
1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성 (또는 기존 프로젝트 사용)
3. Google Calendar API 활성화
4. OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)
5. 승인된 리디렉션 URI 추가:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://[vercel-domain]/api/auth/callback/google`

### 5. 로컬 실행 테스트
```bash
cd "LLM/Schedule/upcoming"
npm run dev
```
→ http://localhost:3000 에서 확인

### 6. GitHub 저장소 생성 및 Push
```bash
cd "LLM/Schedule/upcoming"
git init
git add .
git commit -m "feat: initial Upcoming app setup"
gh repo create ahnsick3k/Upcoming --public
git remote add origin https://github.com/ahnsick3k/Upcoming.git
git push -u origin main
```

### 7. Vercel 배포
1. https://vercel.com → New Project → Import `ahnsick3k/Upcoming`
2. 환경변수 설정 (위 .env.local 내용 그대로, AUTH_URL은 Vercel 도메인으로 변경)
3. Deploy

---

## 파일 구조

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  ✅
│   │   ├── events/route.ts              ✅
│   │   └── calendars/
│   │       ├── google/route.ts          ✅
│   │       └── apple/route.ts           ✅
│   ├── globals.css                      ✅ (Meta 디자인 시스템)
│   ├── layout.tsx                       ✅
│   └── page.tsx                         ✅
├── components/
│   ├── EventCard.tsx                    ✅
│   ├── EventModal.tsx                   ✅
│   └── AppleConnectModal.tsx            ✅
├── lib/
│   ├── auth.ts                          ✅
│   ├── dday.ts                          ✅
│   └── supabase.ts                      ✅
└── types/
    └── index.ts                         ✅

❌ 미생성:
└── app/providers.tsx                    ← 다음에 바로 만들 것
```

---

## 다음 세션 시작 순서

1. `providers.tsx` 생성 (5분)
2. `.env.local` 파일 생성 (환경변수 입력)
3. Supabase SQL 실행
4. Google Cloud Console OAuth 설정
5. `npm run dev` 로 로컬 테스트
6. GitHub push → Vercel 배포
