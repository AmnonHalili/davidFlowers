import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Verify user is an admin
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!dbUser || dbUser.role !== UserRole.ADMIN) {
            return new NextResponse('Forbidden: Admins Only', { status: 403 });
        }

        const subscription = await req.json();

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return new NextResponse('Invalid subscription data', { status: 400 });
        }

        // Save or update the subscription in the database
        await prisma.pushSubscription.upsert({
            where: {
                endpoint: subscription.endpoint,
            },
            create: {
                userId: dbUser.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                userAgent: req.headers.get('user-agent') || 'Unknown Device'
            },
            update: {
                userId: dbUser.id,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                userAgent: req.headers.get('user-agent') || 'Unknown Device'
            }
        });

        return NextResponse.json({ success: true, message: 'Subscription saved' });

    } catch (error) {
        console.error('[PUSH_SUBSCRIBE_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
