import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {baseURL} from "@/lib/api";
import {useAuth} from "@/lib/AuthContext";

function isLoggedIn(req: NextRequest) {

    const authCookie = req.cookies.get('csrf_token') // Replace 'session' with your actual auth cookie name

    if (authCookie) {
        // Verify the cookie is valid by making a request to your API
        try {
            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            return false;
        }
    }

    return false;
}

export async function middleware(req: NextRequest) {
    const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
    const pathname = req.nextUrl.pathname;

    // Allow static files and the landing page ("/") even during maintenance.
    if (maintenanceMode && pathname !== '/') {
        return NextResponse.redirect(new URL('/', req.url))
    }

    const check = true

    if (pathname === '/login' || pathname === '/signup' ) {
        // Check for authentication cookie
        if (isLoggedIn(req)) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
    }

    // check if toke param is valid
    if ((pathname === '/password-reset' || pathname === '/activate-account') && check) {
        const params = req.nextUrl.searchParams.get("token");
        if (!params || params === "") {
            return NextResponse.redirect(new URL('/not-found', req.url))
        }

        const base = process.env.ENVIRONMENT === 'dev' ? "http://localhost:8080" : "https://api.animepoll.net";

        const endpoint = pathname === '/password-reset' ? `/user/check-reset-token?token=${params}` : `/auth/check-activation-token?token=${params}`;

        console.log('middleware: calling', base + endpoint)

        const res = await fetch(base+endpoint);

        const data = await res.json();

        console.log(data);

        if (res.status === 400) {
            return NextResponse.redirect(new URL('/login', req.url))
        }

        if (res.status !== 200) {
            return NextResponse.redirect(new URL('/not-found', req.url))
        }

        if (pathname === '/activate-account' && (data && data.token_used)) {
            return NextResponse.redirect(new URL('/login', req.url))
        }
    }


    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
