import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET,
  );
  oauth2Client.setCredentials({ access_token: session.accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const timeMin = new Date();
  timeMin.setMonth(timeMin.getMonth() - 3);
  const timeMax = new Date();
  timeMax.setFullYear(timeMax.getFullYear() + 1);

  const { data } = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 500,
  });

  const gEvents = data.items ?? [];
  const supabase = getSupabaseAdmin();

  const upserts = gEvents
    .filter((e) => e.start?.date || e.start?.dateTime)
    .map((e) => ({
      user_id: session.user!.id,
      title: e.summary ?? '(제목 없음)',
      date: e.start!.date ?? e.start!.dateTime!.split('T')[0],
      end_date: e.end?.date ?? e.end?.dateTime?.split('T')[0] ?? null,
      description: e.description ?? null,
      location: e.location ?? null,
      source: 'google',
      external_id: e.id,
      all_day: !!e.start?.date,
    }));

  if (upserts.length > 0) {
    await supabase
      .from('events')
      .upsert(upserts, { onConflict: 'user_id,external_id' });
  }

  return NextResponse.json({ synced: upserts.length });
}
