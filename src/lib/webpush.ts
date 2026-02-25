import webPush from 'web-push';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
    webPush.setVapidDetails(
        process.env.VAPID_SUBJECT,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function sendWebPushNotification(subscriptions: any[], payload: object) {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        console.warn('VAPID keys not configured, skipping push notification.');
        return;
    }

    const payloadString = JSON.stringify(payload);

    const promises = subscriptions.map(async (sub) => {
        try {
            await webPush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                },
                payloadString
            );
        } catch (error: any) {
            console.error('Failed to send push notification to subscription', sub.id, error);
            // If the subscription is no longer valid (e.g. user revoked permission in browser)
            if (error.statusCode === 410 || error.statusCode === 404) {
                console.log('Subscription expired/revoked. Could be deleted from DB here.');
                // Optional: Delete from DB via a separate Prisma call to keep it clean
            }
        }
    });

    await Promise.allSettled(promises);
}
