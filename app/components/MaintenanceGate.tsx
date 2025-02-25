"use client"

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";

interface MaintenanceGateProps {
    children: React.ReactNode;
}

const MaintenanceGate = ({ children }: MaintenanceGateProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const { addToast } = useToast();

    useEffect(() => {
        const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
        if (isMaintenance) {
            // If a token exists, remove it so logged-in users are kicked out.
            if (localStorage.getItem("token")) {
                localStorage.removeItem("token");
                localStorage.removeItem("expires_at");
            }
            // If not on the landing page, redirect to it and show a maintenance notification.
            if (pathname !== "/") {
                addToast("Site is under maintenance", "info");
                router.push("/");
            }
        }
    }, [pathname, router, addToast]);

    return <>{children}</>;
};

export default MaintenanceGate;
