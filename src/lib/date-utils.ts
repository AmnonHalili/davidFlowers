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
    const minutes = israelDate.getMinutes();
    const totalMinutes = hour * 60 + minutes;

    // Friday/Erev Chag slots (as defined in CartDrawer.tsx)
    // 08:00 - 12:30 (480 min)
    // 12:30 - 14:30 (750 min)
    if (totalMinutes === 480) return "08:00 - 12:30";
    if (totalMinutes === 750) return "12:30 - 14:30";

    // Regular Day slots (as defined in CartDrawer.tsx)
    // 10:00 - 13:00 (600 min)
    // 13:00 - 16:00 (780 min)
    // 16:00 - 19:00 (960 min)
    if (totalMinutes === 600) return "10:00 - 13:00";
    if (totalMinutes === 780) return "13:00 - 16:00";
    if (totalMinutes === 960) return "16:00 - 19:00";

    // Fallback for custom times or manually entered data
    return format(israelDate, 'HH:mm');
}
