"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import {useAuth} from "@/lib/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, loading, router]);

    // Show loading state while checking authentication
    if (loading) {
        return <div>Loading...</div>;
    }

    // Only render children if authenticated
    return isAuthenticated ? <>{children}</> : null;
}

export default ProtectedRoute;
