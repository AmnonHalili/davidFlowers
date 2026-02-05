'use client';

import { useState } from 'react';
import { Search, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Subscriber {
    email: string;
    name: string;
    joinedAt: Date;
}

export default function SubscribersList({ initialSubscribers }: { initialSubscribers: Subscriber[] }) {
    const [search, setSearch] = useState('');
    const [copiedAll, setCopiedAll] = useState(false);

    const filtered = initialSubscribers.filter(s =>
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    const copyAllEmails = () => {
        const emails = filtered.map(s => s.email).join(', ');
        navigator.clipboard.writeText(emails);
        setCopiedAll(true);
        toast.success(`הועתקו ${filtered.length} כתובות מייל לרשימה`);
        setTimeout(() => setCopiedAll(false), 3000);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Table Header / Actions */}
            <div className="p-6 border-b border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                        type="text"
                        placeholder="חיפוש לפי שם או מייל..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-david-green"
                    />
                </div>
                <button
                    onClick={copyAllEmails}
                    disabled={filtered.length === 0}
                    className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-50"
                >
                    {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedAll ? 'הועתקו!' : 'העתק את כל המיילים'}
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead>
                        <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                            <th className="px-6 py-3 font-medium">שם הלקוח</th>
                            <th className="px-6 py-3 font-medium">כתובת אימייל</th>
                            <th className="px-6 py-3 font-medium">תאריך הרשמה</th>
                            <th className="px-6 py-3 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {filtered.length > 0 ? (
                            filtered.map((sub, idx) => (
                                <tr key={sub.email} className="hover:bg-stone-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-stone-900">{sub.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-stone-600 font-mono">{sub.email}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-stone-400">
                                            {new Date(sub.joinedAt).toLocaleDateString('he-IL')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-left">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(sub.email);
                                                toast.success('המייל הועתק');
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-stone-400 hover:text-david-green transition-all"
                                            title="העתק מייל בודד"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-stone-400">
                                    לא נמצאו מנויים התואמים את החיפוש
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
