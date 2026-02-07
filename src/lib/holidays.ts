import { HebrewCalendar, HDate, flags } from '@hebcal/core';

export type HolidayStatus = 'REGULAR' | 'FRIDAY_LIKE' | 'CLOSED';

export function getHolidayStatus(date: Date): HolidayStatus {
    const hd = new HDate(date);
    const holidays = HebrewCalendar.getHolidaysOnDate(hd, true); // true = include Erev

    if (!holidays || holidays.length === 0) {
        return 'REGULAR';
    }

    for (const holiday of holidays) {
        const mask = holiday.mask;
        const desc = holiday.desc;

        // 1. Check for CLOSED days (Yom Tov / Chag)
        // includes: Rosh Hashana, Yom Kippur, Sukkot, Pesach, Shavuot
        if (mask & flags.CHAG) {
            return 'CLOSED';
        }

        // Specifically check for Chol HaMoed - we treat it as REGULAR business day usually,
        // unless policy changes. Currently falling through to REGULAR is correct.

        // 2. Check for EREV CHAG (Day before holiday) -> Like Friday (Half Day)
        // flags.EREV applies to the day before the Chag starts.
        if (mask & flags.EREV) {
            return 'FRIDAY_LIKE';
        }

        // Fallback checks just in case flags are tricky:
        if (desc.startsWith('Erev')) return 'FRIDAY_LIKE';
        if (desc.includes('Yom Kippur') && !desc.startsWith('Erev')) return 'CLOSED';
    }

    return 'REGULAR';
}
