import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {baseURL} from "@/lib/api";

export async function middleware(req: NextRequest) {
    const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
    const pathname = req.nextUrl.pathname

    // Allow static files and the landing page ("/") even during maintenance.
    if (maintenanceMode && pathname !== '/') {
        return NextResponse.redirect(new URL('/', req.url))
    }

    // check if toke param is valid
    if (pathname === '/password-reset') {
        const params = req.nextUrl.searchParams.get("token");
        if (!params || params === "") {
            return NextResponse.redirect(new URL('/not-found', req.url))
        }

        const base = req.url.startsWith("https://animepoll") ? "https://api.animepoll.net" : "http://localhost:8080"

        const res = await fetch(base + "/user/check-reset-token?token="+params)

        if (res.status !== 200) {
            return NextResponse.redirect(new URL('/not-found', req.url))
        }

        // return NextResponse.redirect(new URL('/not-found', req.url))

    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
