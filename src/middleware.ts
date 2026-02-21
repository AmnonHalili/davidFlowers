import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes
const isProtectedRoute = createRouteMatcher([
    '/account(.*)',
    '/admin(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
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
