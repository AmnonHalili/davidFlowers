import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIME_ZONE = 'Asia/Jerusalem';

/**
 * Reconstructs the full time slot range from a stored delivery date.
 * Based on predefined slots in CartDrawer.tsx
 */
export function getDeliverySlot(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const israelDate = toZonedTime(d, TIME_ZONE);
    const hour = israelDate.getHours();

    // Friday/Erev Chag slots
    if (hour === 8) return "08:00 - 11:00";
    if (hour === 11) return "11:00 - 14:00";

    // Regular Day slots
    if (hour === 10) return "10:00 - 13:00";
    if (hour === 13) return "13:00 - 16:00";
    if (hour === 16) return "16:00 - 19:00";

    // Fallback for custom times or manually entered data
    return format(israelDate, 'HH:mm');
}
