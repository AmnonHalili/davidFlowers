export type Frequency = 'WEEKLY' | 'BIWEEKLY';
export type DayOfWeek = 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

const DAY_MAP: Record<DayOfWeek, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
};

/**
 * Calculates the next delivery date based on the preferred day and frequency.
 * If today is the preferred day, it will schedule for today if it's early enough (e.g., before 10 AM),
 * otherwise it schedules for the next occurrence.
 */
export function calculateNextDeliveryDate(
    preferredDay: DayOfWeek,
    frequency: Frequency,
    startDate: Date = new Date()
): Date {
    const targetDay = DAY_MAP[preferredDay];
    const currentDay = startDate.getDay();

    let daysUntilNext = (targetDay - currentDay + 7) % 7;

    // If today is the preferred day, but maybe it's too late to deliver today?
    const currentHour = startDate.getHours();
    const currentMinutes = startDate.getMinutes();
    const currentTotalMinutes = (currentHour * 60) + currentMinutes;

    // Cutoff: 12:30 (750 min) for Fridays, 10:00 (600 min) for other days (as per original logic)
    const cutoffMinutes = (targetDay === 5) ? (12 * 60 + 30) : (10 * 60);
    const isTooLateForToday = currentTotalMinutes >= cutoffMinutes;

    if (daysUntilNext === 0 && isTooLateForToday) {
        daysUntilNext = 7;
    }

    const nextDate = new Date(startDate);
    nextDate.setDate(startDate.getDate() + daysUntilNext);
    nextDate.setHours(9, 0, 0, 0); // Standardize to 9 AM delivery window start

    return nextDate;
}

/**
 * For mocking/demo purposes: returns a human readable date string
 */
export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
