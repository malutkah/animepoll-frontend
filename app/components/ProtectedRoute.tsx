"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const expiresAt = localStorage.getItem("expires_at");
        if (!token || !expiresAt || Number(expiresAt) * 1000 < Date.now()) {
            router.push("/login");
        }
    }, [router]);

    return <>{children}</>;
}

export default ProtectedRoute;
