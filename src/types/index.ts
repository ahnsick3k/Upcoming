export type EventSource = 'manual' | 'google' | 'apple';

export interface ScheduleEvent {
  id: string;
  user_id: string;
  title: string;
  date: string;          // ISO date: "2026-05-15"
  end_date?: string;     // for multi-day events
  description?: string;
  location?: string;
  source: EventSource;
  external_id?: string;  // Google/Apple event ID
  color?: string;
  all_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConnectedCalendar {
  id: string;
  user_id: string;
  provider: 'google' | 'apple';
  name: string;
  apple_username?: string;    // encrypted
  apple_app_password?: string; // encrypted
  last_synced_at?: string;
  created_at: string;
}

export interface DayEvent extends ScheduleEvent {
  daysLeft: number;    // negative = past, 0 = today, positive = future
  dLabel: string;      // "D-3" | "D-DAY" | "D+2"
}
