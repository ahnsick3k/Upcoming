import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { DAVClient } from 'tsdav';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username, appPassword } = await req.json();
  if (!username || !appPassword) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  try {
    const client = new DAVClient({
      serverUrl: 'https://caldav.icloud.com',
      credentials: { username, password: appPassword },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    });

    await client.login();
    const calendars = await client.fetchCalendars();

    const supabase = getSupabaseAdmin();
    let totalSynced = 0;

    const timeMin = new Date();
    timeMin.setMonth(timeMin.getMonth() - 3);
    const timeMax = new Date();
    timeMax.setFullYear(timeMax.getFullYear() + 1);

    for (const cal of calendars) {
      const objects = await client.fetchCalendarObjects({
        calendar: cal,
        timeRange: { start: timeMin.toISOString(), end: timeMax.toISOString() },
      });

      for (const obj of objects) {
        if (!obj.data) continue;
        const lines = obj.data.split('\n');

        const getValue = (key: string): string | undefined =>
          lines.find((l: string) => l.startsWith(key + ':'))?.split(':').slice(1).join(':').trim();

        const uid = getValue('UID');
        const summary = getValue('SUMMARY') ?? '(제목 없음)';
        const dtstart = getValue('DTSTART') ?? getValue('DTSTART;VALUE=DATE');
        const dtend = getValue('DTEND') ?? getValue('DTEND;VALUE=DATE');
        const description = getValue('DESCRIPTION') ?? null;
        const location = getValue('LOCATION') ?? null;

        if (!uid || !dtstart) continue;

        const parseDate = (s: string) => {
          if (s.length === 8) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
          return s.slice(0, 10);
        };

        const isAllDay = dtstart.length === 8;

        await supabase.from('events').upsert(
          {
            user_id: session.user.id,
            title: summary,
            date: parseDate(dtstart),
            end_date: dtend ? parseDate(dtend) : null,
            description,
            location,
            source: 'apple',
            external_id: uid,
            all_day: isAllDay,
          },
          { onConflict: 'user_id,external_id' },
        );
        totalSynced++;
      }
    }

    // Save encrypted credentials (base64 for demo — use proper encryption in prod)
    await supabase.from('connected_calendars').upsert(
      {
        user_id: session.user.id,
        provider: 'apple',
        name: 'iCloud Calendar',
        apple_username: Buffer.from(username).toString('base64'),
        apple_app_password: Buffer.from(appPassword).toString('base64'),
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,provider' },
    );

    return NextResponse.json({ synced: totalSynced });
  } catch (err) {
    console.error('Apple CalDAV error:', err);
    return NextResponse.json({ error: '연결 실패. Apple ID와 앱 전용 비밀번호를 확인해주세요.' }, { status: 400 });
  }
}
