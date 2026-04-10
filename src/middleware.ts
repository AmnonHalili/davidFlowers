import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define route matchers
const isProtectedRoute = createRouteMatcher([
    '/account(.*)',
    '/admin(.*)'
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isPausedPageRoute = createRouteMatcher(['/paused(.*)']);

export default clerkMiddleware(async (auth, req) => {
    // Check if site is paused via environment variable
    const isPaused = process.env.NEXT_PUBLIC_SITE_PAUSED === 'true';

    // If site is paused, redirect everything except admin and the paused page
    if (isPaused && !isAdminRoute(req) && !isPausedPageRoute(req)) {
        const url = req.nextUrl.clone();
        url.pathname = '/paused';
        return NextResponse.redirect(url);
    }

    // Skip protection in development mode to allow testing without Clerk in localhost
    if (process.env.NODE_ENV === 'development') {
        return;
    }

    if (isProtectedRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
