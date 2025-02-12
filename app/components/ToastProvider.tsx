"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface Toast {
    id: number
    message: string
    type: "success" | "error" | "info"
    duration: number
}

interface ToastContextProps {
    addToast: (message: string, type?: "success" | "error" | "info", duration?: number) => void
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = (message: string, type: "success" | "error" | "info" = "info", duration: number = 3000) => {
        const id = Date.now()
        setToasts((prev) => [...prev, { id, message, type, duration }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id))
        }, duration)
    }

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 right-4 space-y-2 z-50">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`p-4 rounded shadow text-white ${
                            toast.type === "success"
                                ? "bg-green-500"
                                : toast.type === "error"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                        }`}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) throw new Error("useToast must be used within a ToastProvider")
    return context
}
