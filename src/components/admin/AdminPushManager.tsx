import { BellOff } from 'lucide-react';

export default function AdminPushManager() {
    return (
        <div role="status" className="rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-xs text-stone-300" dir="rtl">
            <div className="flex items-center gap-2 font-bold"><BellOff className="h-4 w-4" />התראות למכשיר מושהות זמנית</div>
            <p className="mt-2">אישור התראות בדפדפן אינו מפעיל כרגע משלוח התראות. ההזמנות זמינות בממשק הניהול; נודיע כשניתן יהיה לרשום מחדש את המכשיר.</p>
        </div>
    );
}
