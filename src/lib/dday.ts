import { DayEvent, ScheduleEvent } from '@/types';
import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';

export function getDaysLeft(dateStr: string): number {
  const today = startOfDay(new Date());
  const eventDate = startOfDay(parseISO(dateStr));
  return differenceInCalendarDays(eventDate, today);
}

export function getDLabel(daysLeft: number): string {
  if (daysLeft === 0) return 'D-DAY';
  if (daysLeft > 0) return `D-${daysLeft}`;
  return `D+${Math.abs(daysLeft)}`;
}

export function enrichEvent(event: ScheduleEvent): DayEvent {
  const daysLeft = getDaysLeft(event.date);
  return { ...event, daysLeft, dLabel: getDLabel(daysLeft) };
}

export function sortByDday(events: DayEvent[]): DayEvent[] {
  return [...events].sort((a, b) => {
    // Today first, then upcoming (ascending), then past (descending)
    const aAbs = a.daysLeft >= 0 ? a.daysLeft : Infinity + Math.abs(a.daysLeft);
    const bAbs = b.daysLeft >= 0 ? b.daysLeft : Infinity + Math.abs(b.daysLeft);
    if (a.daysLeft >= 0 && b.daysLeft >= 0) return a.daysLeft - b.daysLeft;
    if (a.daysLeft < 0 && b.daysLeft < 0) return b.daysLeft - a.daysLeft;
    if (a.daysLeft >= 0) return -1;
    return 1;
  });
}

export function getBadgeClass(daysLeft: number): string {
  if (daysLeft === 0) return 'badge badge-today';
  if (daysLeft > 0 && daysLeft <= 7) return 'badge badge-critical';
  if (daysLeft > 7 && daysLeft <= 30) return 'badge badge-warning';
  if (daysLeft > 30) return 'badge badge-primary';
  return 'badge badge-steel';
}

export function getSourceIcon(source: ScheduleEvent['source']): string {
  switch (source) {
    case 'google': return 'google';
    case 'apple': return 'apple';
    default: return 'manual';
  }
}
