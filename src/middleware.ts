import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
    try {
        const path = req.nextUrl.pathname;
        const isProtectedRoute = path.startsWith('/account') || path.startsWith('/admin');

        if (isProtectedRoute) {
            const { userId, redirectToSignIn } = await auth();
            if (!userId) {
                return redirectToSignIn();
            }
        }
        return NextResponse.next();
    } catch (error) {
        console.error('Middleware execution failed:', error);
        return NextResponse.next();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
