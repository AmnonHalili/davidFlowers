'use client';

import { useState } from 'react';
import { updateSiteConfig } from '@/app/actions/site-config-actions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AnnouncementSettingsFormProps {
    initialConfig: {
        isActive: boolean;
        text: string;
    };
}

export default function AnnouncementSettingsForm({ initialConfig }: AnnouncementSettingsFormProps) {
    const [isActive, setIsActive] = useState(initialConfig.isActive);
    const [text, setText] = useState(initialConfig.text);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await updateSiteConfig('announcement_bar', { isActive, text });

        if (result.success) {
            toast.success('הגדרות עודכנו בהצלחה!');
        } else {
            toast.error('שגיאה בעדכון ההגדרות.');
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
                <h2 className="text-xl font-bold text-stone-800">פס מבצע עליון</h2>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-stone-600">
                        {isActive ? 'פעיל' : 'לא פעיל'}
                    </span>
                    <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-all ${isActive ? 'left-1' : 'left-7'}`} />
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="announcement-text" className="block text-sm font-medium text-stone-700">
                    טקסט ההודעה
                </label>
                <textarea
                    id="announcement-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-david-green focus:border-transparent outline-none transition-all"
                    placeholder="לדוגמה: ולנטיין דיי: 5% הנחה על כל הזרים באתר! בתוקף עד ה-15 בפברואר."
                />
                <p className="text-xs text-stone-500">
                    מומלץ לשמור על טקסט קצר וממוקד (עד שורה אחת במובייל).
                </p>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-david-green text-white px-6 py-2 rounded-lg font-medium hover:bg-david-green/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    שמור שינויים
                </button>
            </div>
        </form>
    );
}
