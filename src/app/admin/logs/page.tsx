import prisma from '@/lib/prisma';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AdminLogsPage() {
    let logs: any[] = [];
    let error = null;

    try {
        logs = await prisma.systemLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });
    } catch (e: any) {
        console.error('Failed to fetch logs:', e);
        error = e.message;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto" dir="rtl">
            <h1 className="text-3xl font-bold mb-6 text-stone-800">לוגים של המערכת (System Logs)</h1>
            <p className="mb-6 text-stone-600">מציג את ה-100 פעולות האחרונות במערכת (Webhook, שגיאות, מיילים)</p>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-stone-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                            <tr>
                                <th className="p-4 whitespace-nowrap">זמן</th>
                                <th className="p-4 whitespace-nowrap">רמה</th>
                                <th className="p-4 whitespace-nowrap">מקור</th>
                                <th className="p-4 w-1/3">הודעה</th>
                                <th className="p-4 w-1/3">מידע נוסף (Metadata)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                                    <td className="p-3 text-stone-500 whitespace-nowrap" dir="ltr">
                                        {new Date(log.createdAt).toLocaleString('he-IL', {
                                            timeZone: 'Asia/Jerusalem',
                                            year: '2-digit',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${log.level === 'ERROR' ? 'bg-red-100 text-red-700' :
                                            log.level === 'WARN' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-blue-50 text-blue-700'
                                            }`}>
                                            {log.level}
                                        </span>
                                    </td>
                                    <td className="p-4 whitespace-nowrap font-medium text-stone-700">
                                        {log.source}
                                    </td>
                                    <td className="p-4 text-stone-800">
                                        {log.message}
                                    </td>
                                    <td className="p-4 font-mono text-xs text-stone-500 overflow-x-auto max-w-xs">
                                        {log.metadata ? (
                                            <details>
                                                <summary className="cursor-pointer hover:text-stone-800">הצג מידע</summary>
                                                <pre className="mt-2 p-2 bg-stone-50 rounded border border-stone-200">
                                                    {JSON.stringify(log.metadata, null, 2)}
                                                </pre>
                                            </details>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                            {error && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-red-500 bg-red-50">
                                        שגיאה בטעינת הלוגים: {error}
                                        <br />
                                        <span className="text-xs text-stone-500">נסה לרענן את העמוד או לבצע Deploy מחדש</span>
                                    </td>
                                </tr>
                            )}
                            {!error && logs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-stone-400">
                                        אין עדיין לוגים במערכת.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
