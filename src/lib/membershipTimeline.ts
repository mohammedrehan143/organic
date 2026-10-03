import { Membership, MembershipPlanType } from '@/types/cafe';

/**
 * Standard date formatter for Asia/Kolkata (IST, UTC+05:30)
 */
export function getISTDateString(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
}

export function parseDateToISTString(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
}

/**
 * Calculate the difference in calendar days between two YYYY-MM-DD strings.
 * Returns dateStrA - dateStrB in days.
 */
export function diffCalendarDays(dateStrA: string, dateStrB: string): number {
  const [y1, m1, d1] = dateStrA.split('-').map(Number);
  const [y2, m2, d2] = dateStrB.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a YYYY-MM-DD string
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().split('T')[0];
}

export function formatDayDisplay(dateStr: string): { formattedDate: string; dayName: string } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const dayName = new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', weekday: 'short' }).format(date);
  const formattedDate = new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', day: '2-digit', month: 'short' }).format(date);
  return { formattedDate, dayName };
}

export interface DayTimelineItem {
  dayNumber: number; // 1 to 7
  dateStr: string;   // 'YYYY-MM-DD'
  formattedDate: string; // '03 Oct'
  dayName: string; // 'Sat'
  status: 'delivered' | 'active_today' | 'upcoming';
  label: string;
  isLastDay?: boolean;
  isPaymentDate?: boolean;
}

export interface SettleDayInfo {
  dateStr: string; // 'YYYY-MM-DD'
  formattedDate: string; // '09 Oct'
  dayName: string;
  status: 'upcoming_settlement' | 'due_today' | 'overdue' | 'settled';
  label: string;
}

export interface MembershipTimelineResult {
  isCancelled: boolean;
  isPostpaid: boolean;
  isUpcoming: boolean; // Start date is in the future
  startsTomorrow: boolean; // Start date is tomorrow
  startsToday: boolean; // Start date is today
  isActive: boolean; // Between start and end date
  isDue: boolean; // Week-end bill is due (end date reached or passed)
  isDueToday: boolean; // Today is the exact end date
  isOverdue: boolean; // Today is past the end date
  currentDayNumber: number; // 1 to 7 (or 0 if upcoming)
  totalDurationDays: number; // 7 (or 180)
  totalDays: number; // alias for totalDurationDays
  daysRemaining: number;
  startDateStr: string;
  endDateStr: string;
  startDateDisplay: string;
  endDateDisplay: string;
  statusBadgeText: string;
  statusBadgeVariant: 'cancelled' | 'due' | 'upcoming' | 'active';
  timelineDays: DayTimelineItem[];
  settleDay: SettleDayInfo;
}

/**
 * Robust timeline & validity calculator for Zafiroo memberships
 */
export function calculateMembershipTimeline(
  membership: Membership,
  refDate: Date = new Date()
): MembershipTimelineResult {
  const isCancelled = membership.status === 'cancelled';
  const isPostpaid = membership.planType !== '6_months' && membership.billingType === 'postpaid';
  const isPaid = membership.paymentStatus === 'paid' || membership.billingType === 'prepaid';
  const totalDurationDays = membership.planType === '6_months' ? 180 : 7;

  const todayStr = getISTDateString(refDate);
  const startStr = parseDateToISTString(membership.startDate);
  const endStr = parseDateToISTString(membership.endDate);

  const diffStart = diffCalendarDays(startStr, todayStr); // > 0 if start is future
  const diffEnd = diffCalendarDays(endStr, todayStr);     // > 0 if end is future, 0 if today is end, < 0 if past

  const isUpcoming = !isCancelled && diffStart > 0;
  const startsTomorrow = !isCancelled && diffStart === 1;
  const startsToday = !isCancelled && diffStart === 0;

  // On the end date (diffEnd === 0), it is the last day of membership & week-end bill is due today.
  // Past the end date (diffEnd < 0), postpaid bill is overdue.
  const isDueToday = !isCancelled && isPostpaid && !isPaid && diffEnd === 0;
  const isOverdue = !isCancelled && isPostpaid && !isPaid && diffEnd < 0;
  const isDue = !isCancelled && (!isPaid ? (isPostpaid && diffEnd <= 0) || membership.paymentStatus === 'due' : diffEnd <= 0 && membership.planType === '6_months');

  // Active while within membership cycle (not cancelled, not upcoming, not overdue)
  const isActive = !isCancelled && !isUpcoming && !isOverdue;

  // Current day index of the 7-day cycle (Day 1 to Day 7)
  const daysSinceStart = diffCalendarDays(todayStr, startStr);
  const currentDayNumber = isUpcoming ? 0 : Math.max(1, Math.min(totalDurationDays, daysSinceStart + 1));
  const daysRemaining = Math.max(0, diffEnd);

  // Formatted date representations
  const { formattedDate: startFormatted } = formatDayDisplay(startStr);
  const { formattedDate: endFormatted } = formatDayDisplay(endStr);

  let statusBadgeText = 'ACTIVE MEMBER';
  let statusBadgeVariant: 'cancelled' | 'due' | 'upcoming' | 'active' = 'active';

  if (isCancelled) {
    statusBadgeText = '🚫 CANCELLED';
    statusBadgeVariant = 'cancelled';
  } else if (isOverdue) {
    statusBadgeText = '🚨 BILL OVERDUE';
    statusBadgeVariant = 'due';
  } else if (isDueToday) {
    statusBadgeText = '🚨 BILL DUE TODAY • FINAL DAY';
    statusBadgeVariant = 'due';
  } else if (isDue) {
    statusBadgeText = '🚨 7-DAY BILL DUE';
    statusBadgeVariant = 'due';
  } else if (startsTomorrow) {
    statusBadgeText = '🌅 STARTS TOMORROW';
    statusBadgeVariant = 'upcoming';
  } else if (isUpcoming) {
    statusBadgeText = `🌅 STARTS ON ${startFormatted.toUpperCase()}`;
    statusBadgeVariant = 'upcoming';
  } else {
    statusBadgeText = `🟢 ACTIVE • DAY ${currentDayNumber} OF ${totalDurationDays}`;
    statusBadgeVariant = 'active';
  }

  // Generate 7-day milk delivery timeline items (Day 1 to Day 7: e.g. Oct 3 to Oct 9)
  const timelineDays: DayTimelineItem[] = [];
  const daysToGenerate = Math.min(7, totalDurationDays);

  for (let i = 0; i < daysToGenerate; i++) {
    const dayDateStr = addDaysToDateString(startStr, i);
    const { formattedDate, dayName } = formatDayDisplay(dayDateStr);
    const dayDiff = diffCalendarDays(dayDateStr, todayStr);
    const isLastDay = i === daysToGenerate - 1;
    const isPaymentDate = isLastDay;

    let status: 'delivered' | 'active_today' | 'upcoming';
    let label: string;

    if (dayDiff < 0) {
      status = 'delivered';
      label = isLastDay ? (isPaid ? 'Delivered & Paid ✓' : 'Delivered (Due)') : 'Delivered ✓';
    } else if (dayDiff === 0) {
      status = 'active_today';
      label = isLastDay ? (isPaid ? 'Today 🥛' : 'Due Today 💳') : 'Today 🥛';
    } else {
      status = 'upcoming';
      label = isLastDay ? 'Pay Date 💳' : 'Scheduled';
    }

    timelineDays.push({
      dayNumber: i + 1,
      dateStr: dayDateStr,
      formattedDate,
      dayName,
      status,
      label,
      isLastDay,
      isPaymentDate,
    });
  }

  // Settlement Day is the Last Date of Membership (End Date, e.g. Oct 9)
  const { formattedDate: settleFormatted, dayName: settleDayName } = formatDayDisplay(endStr);
  let settleStatus: 'upcoming_settlement' | 'due_today' | 'overdue' | 'settled';
  let settleLabel: string;

  if (isPaid) {
    settleStatus = 'settled';
    settleLabel = 'Paid & Settled ✓';
  } else if (diffEnd === 0) {
    settleStatus = 'due_today';
    settleLabel = 'Due Today';
  } else if (diffEnd < 0) {
    settleStatus = 'overdue';
    settleLabel = 'Due / Overdue';
  } else {
    settleStatus = 'upcoming_settlement';
    settleLabel = 'Settlement Day';
  }

  const settleDay: SettleDayInfo = {
    dateStr: endStr,
    formattedDate: settleFormatted,
    dayName: settleDayName,
    status: settleStatus,
    label: settleLabel,
  };

  return {
    isCancelled,
    isPostpaid,
    isUpcoming,
    startsTomorrow,
    startsToday,
    isActive,
    isDue,
    isDueToday,
    isOverdue,
    currentDayNumber,
    totalDurationDays,
    totalDays: totalDurationDays,
    daysRemaining,
    startDateStr: startStr,
    endDateStr: endStr,
    startDateDisplay: startFormatted,
    endDateDisplay: endFormatted,
    statusBadgeText,
    statusBadgeVariant,
    timelineDays,
    settleDay,
  };
}

/**
 * Calculates start_date and end_date for a brand new membership enrolled today.
 * Rule: Starts tomorrow morning at 06:00:00 IST.
 * 7-Day plan ends on Day 7 (giving exactly 7 full days of milk delivery: Days 1 to 7 inclusive, e.g. 3rd to 9th).
 * The last date of membership (Day 7) is also the payment / settlement date.
 */
export function calculateNewEnrollmentDates(
  planType: MembershipPlanType,
  refDate: Date = new Date()
): { startDate: string; endDate: string; durationDays: number } {
  const durationDays = planType === '6_months' ? 180 : 7;
  const todayStr = getISTDateString(refDate);
  const startStr = addDaysToDateString(todayStr, 1); // Next day
  // 7 days duration inclusive: Day 1 (startStr + 0) to Day 7 (startStr + 6).
  // E.g. start Oct 3 -> end Oct 9 (from 3 to 9 is exactly 7 days).
  const endStr = addDaysToDateString(startStr, durationDays - 1);

  // Explicit ISO string representation with IST offset (+05:30)
  const startDate = `${startStr}T06:00:00+05:30`;
  const endDate = `${endStr}T06:00:00+05:30`;

  return {
    startDate,
    endDate,
    durationDays,
  };
}
