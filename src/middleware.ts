import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes
const isProtectedRoute = createRouteMatcher([
    '/account(.*)',
    '/admin(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
    // Only protect operational dashboard routes.
    // Public store routes should NEVER crash due to auth middleware.
    if (isProtectedRoute(req)) {
        const { userId, redirectToSignIn } = await auth();
        if (!userId) {
            return redirectToSignIn();
        }
    }
    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
