// lib/AuthContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { baseURL } from '@/lib/api';

interface AuthContextType {
    isAuthenticated: boolean;
    username: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; totp_required?: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshCSRFToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [csrfToken, setCsrfToken] = useState<string>('');
    const router = useRouter();

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Make a request to a protected endpoint
                const res = await fetch(baseURL() + '/user/me', {
                    credentials: 'include', // Important: This includes cookies in the request
                });

                if (res.ok) {
                    const data = await res.json();
                    setIsAuthenticated(true);
                    setUsername(data.username);
                } else {
                    setIsAuthenticated(false);
                    setUsername(null);
                }
            } catch (err) {
                setIsAuthenticated(false);
                setUsername(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Get CSRF token from cookie
    const refreshCSRFToken = async () => {
        // Make a request to get a fresh CSRF token
        try {
            const res = await fetch(baseURL() + '/auth/csrf-token', {
                method: 'GET',
                credentials: 'include',
            });

            if (res.ok) {
                // The server will set the csrf_token cookie
                // Read it from document.cookie
                const cookies = document.cookie.split(';');
                for (const cookie of cookies) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'csrf_token') {
                        setCsrfToken(value);
                        return value;
                    }
                }
            }
        } catch (err) {
            console.error('Failed to refresh CSRF token', err);
        }
        return '';
    };

    // Initialize CSRF token
    useEffect(() => {
        refreshCSRFToken();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            // Get a fresh CSRF token before login
            // await refreshCSRFToken();

            const res = await fetch(baseURL() + '/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Important for cookies
            });

            const data = await res.json();

            if (res.ok) {
                setIsAuthenticated(true);
                setUsername(data.user);
                // The cookies are automatically stored by the browser
                return { success: true, totp_required: data.totp_required };
            } else {
                return { success: false, error: data.message || 'Login failed' };
            }
        } catch (err) {
            return { success: false, error: 'Network error during login' };
        }
    };

    const logout = async () => {
        try {
            //await refreshCSRFToken();

            await fetch(baseURL() + '/auth/logout', {
                method: 'POST',
                headers: {
                    'X-CSRF-Token': csrfToken,
                },
                credentials: 'include',
            });
        } catch (err) {
            // Continue with local logout even if server logout fails
            console.error('Error during logout:', err);
        } finally {
            setIsAuthenticated(false);
            setUsername(null);
            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                username,
                loading,
                login,
                logout,
                refreshCSRFToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};