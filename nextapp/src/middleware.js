import { NextResponse } from 'next/server';

export async function middleware(request) {
    // Check if this is a page request (not an API request)
    if (!request.nextUrl.pathname.startsWith('/api/')) {
        try {
            // Call the schedule check API
            await fetch(`${request.nextUrl.origin}/api/blog/schedule`, {
                method: 'POST',
            });
        } catch (error) {
            console.error('Error checking scheduled posts:', error);
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
