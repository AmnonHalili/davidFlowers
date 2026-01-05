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
    // Let's say if it's after 10 AM, we move to the next week.
    const isTooLateForToday = startDate.getHours() >= 10;

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
