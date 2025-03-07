"use client"

import Link from "next/link";
import {FormEvent, useState, useCallback} from "react";
import {useRouter} from "next/navigation";
import {baseURL} from "@/lib/api";

interface FormState {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
}

const LoginForm = () => {
    const [formState, setFormState] = useState<FormState>({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Handle input changes
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormState(prev => ({...prev, [name]: value}));

        // Clear errors when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({...prev, [name]: undefined}));
        }
    }, [errors]);

    // Validate form
    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        if (!formState.email) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
            newErrors.email = "Email is invalid";
            isValid = false;
        }

        if (!formState.password) {
            newErrors.password = "Password is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }, [formState]);

    // Handle form submission
    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(baseURL() + "/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formState),
            });

            if (res.status !== 201) {
                const err = await res.json();
                setErrors({general: err.message || "Login failed"});
                setIsLoading(false);
                return;
            }

            const data = await res.json();

            localStorage.setItem("token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);
            localStorage.setItem("expires_at", data.expires_at.toString());
            router.push("/dashboard");
        } catch (err: any) {
            setErrors({general: "Something went wrong. Please try again."});
            setIsLoading(false);
        }
    }, [formState, validateForm, router]);

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Login</h2>

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
                            errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                        aria-invalid={errors.email ? "true" : "false"}
                        aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                        <p id="email-error" className="mt-2 text-red-400 text-sm">{errors.email}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formState.password}
                        onChange={handleChange}
                        className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
                            errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                        aria-invalid={errors.password ? "true" : "false"}
                        aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    {errors.password && (
                        <p id="password-error" className="mt-2 text-red-400 text-sm">{errors.password}</p>
                    )}
                </div>

                {errors.general && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                        <p>{errors.general}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50"
                    aria-busy={isLoading}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    Sign up
                </Link>
            </p>

            <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
                Forgot your password?{" "}
                <Link href="/password-reset" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    Change it here
                </Link>
            </p>
        </div>
    );
};

export default LoginForm;