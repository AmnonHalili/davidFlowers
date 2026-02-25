'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPushManager() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (error) {
            console.error('Service Worker Error', error);
        }
    };

    const subscribeToPush = async () => {
        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;

            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicVapidKey) {
                toast.error('VAPID public key is missing');
                setIsLoading(false);
                return;
            }

            // Convert VAPID key
            const urlBase64ToUint8Array = (base64String: string) => {
                const padding = '='.repeat((4 - base64String.length % 4) % 4);
                const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
                const rawData = window.atob(base64);
                return new Uint8Array(rawData.split('').map((char) => char.charCodeAt(0)));
            };

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
            });

            // Send subscription to our backend
            const res = await fetch('/api/webhooks/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription),
            });

            if (res.ok) {
                setIsSubscribed(true);
                toast.success('מעולה! עכשיו תקבל התראות על הזמנות חדשות למכשיר זה.');
            } else {
                toast.error('שגיאה בשמירת התראות במסד הנתונים.');
                // Fallback attempt to unsubscribe from browser if backend save fails
                await subscription.unsubscribe();
            }

        } catch (error) {
            console.error('Push Subscription Error:', error);
            toast.error('לא הצלחנו להפעיל התראות. ודא שאישרת גישה בהגדרות הדפדפן.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isSupported) {
        return null; // Don't show anything if push isn't supported
    }

    return (
        <button
            onClick={subscribeToPush}
            disabled={isLoading || isSubscribed}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isSubscribed
                ? 'bg-david-green/10 text-david-green border border-david-green/20 cursor-default'
                : 'bg-stone-900 text-white hover:bg-stone-800 shadow-sm active:scale-95'
                }`}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSubscribed ? (
                <Bell className="w-4 h-4" />
            ) : (
                <BellOff className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
                {isSubscribed ? 'התראות מופעלות לדפדפן זה' : 'הפעל התראות מכשיר'}
            </span>
        </button>
    );
}
