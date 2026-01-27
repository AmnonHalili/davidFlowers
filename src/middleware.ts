import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Debug: Vanilla middleware to confirm Edge Runtime is working.
    // If this works, the issue is strictly with @clerk/nextjs initialization (likely keys).
    const path = request.nextUrl.pathname;
    console.log(`[Middleware] Processing request for: ${path}`);

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
