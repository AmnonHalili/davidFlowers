'use client';

import { useState } from 'react';
import { sendTestEmailAction } from '@/app/actions/debug-email';
import { toast } from 'sonner';

export default function EmailDebugPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSend = async () => {
        if (!email) {
            toast.error('Please enter an email address');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await sendTestEmailAction(email);
            setResult(response);

            if (response.success) {
                toast.success('Email sent successfully!');
            } else {
                toast.error('Failed to send email');
            }
        } catch (error) {
            console.error('Client error:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Email Service Debugger</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Send Test Email To:
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                    {loading ? 'Sending...' : 'Send Test Email'}
                </button>

                {result && (
                    <div className={`mt-6 p-4 rounded-md text-sm font-mono overflow-auto ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <h3 className={`font-bold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                            {result.success ? 'SUCCESS' : 'FAILURE'}
                        </h3>

                        <div className="space-y-2 text-xs">
                            <p><strong>Result:</strong></p>
                            <pre className="whitespace-pre-wrap">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 text-sm text-gray-500">
                <p>Use this tool to verify if the Resend email service is configured correctly in the current environment.</p>
                <p className="mt-2 text-xs">It attempts to read <code>RESEND_API_KEY</code> and <code>RESEND_FROM_EMAIL</code> from <code>process.env</code>.</p>
            </div>
        </div>
    );
}
