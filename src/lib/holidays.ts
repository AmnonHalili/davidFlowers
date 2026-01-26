
import { HebrewCalendar, HDate, flags } from '@hebcal/core';

export type HolidayStatus = 'REGULAR' | 'FRIDAY_LIKE' | 'CLOSED';

export function getHolidayStatus(date: Date): HolidayStatus {
    const hd = new HDate(date);
    const holidays = HebrewCalendar.getHolidaysOnDate(hd, true); // true = include Erev

    if (!holidays || holidays.length === 0) {
        return 'REGULAR';
    }

    // Check for specific flags
    for (const holiday of holidays) {
        const mask = holiday.mask;
        const desc = holiday.desc;

        // Erev Chag (Holiday Eve) - Treat as Friday
        // 1. Erev Rosh Hashana
        // 2. Erev Yom Kippur
        // 3. Erev Sukkot
        // 4. Erev Pesach
        // 5. Erev Shavuot

        // Detailed check:
        // CHAG (Yom Tov) = Work Forbidden (Closed)
        // Also check specifically for Yom Kippur / Rosh Hashana by name if needed, 
        // but CHAG usually covers them? 
        // Actually, sometimes Rosh Hashana / Yom Kippur are not marked just as CHAG in some contexts? 
        // But usually they are.
        // Let's rely on description if CHAG is missing, but CHAG should be there for Yom Tov.

        if (mask & flags.CHAG) {
            return 'CLOSED';
        }

        // Yom Kippur specifically might not be CHAG? (It is, but to be safe)
        if (desc.includes('Yom Kippur')) {
            return 'CLOSED';
        }

        if (desc.includes('Rosh Hashana')) {
            return 'CLOSED';
        }
    }

    // Second pass for Erev Chag validation if not closed
    for (const holiday of holidays) {
        const desc = holiday.desc;
        // Explicit string check is safer for "Erev" if flags are ambiguous
        if (desc.startsWith('Erev')) {
            return 'FRIDAY_LIKE';
        }

        // Hol Hamoed - usually regular hours but maybe safer to be regular?
        // User didn't specify Hol Hamoed, assuming Regular.
    }

    return 'REGULAR';
}
