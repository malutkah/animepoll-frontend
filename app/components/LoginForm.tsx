"use client"

import Link from "next/link";
import {FormEvent, useCallback, useState} from "react";
import {useRouter} from "next/navigation";
import {baseURL} from "@/lib/api";
import {Shield} from "lucide-react";
import {useAuth} from "@/lib/AuthContext";
import useTranslation from "@/lib/useTranslation";

interface FormState {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
    totp?: string;
}

const LoginForm = () => {
    const {t} = useTranslation();

    const [formState, setFormState] = useState<FormState>({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const {login} = useAuth();

    // TOTP related states
    const [showTotpVerification, setShowTotpVerification] = useState(false);
    const [totpCode, setTotpCode] = useState("");
    const [loginResponse, setLoginResponse] = useState<any>(null);

    // Handle input changes
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormState(prev => ({...prev, [name]: value}));

        // Clear errors when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({...prev, [name]: undefined}));
        }
    }, [errors]);

    // Handle TOTP code input change
    const handleTotpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow digits and limit to 6 characters
        const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
        if (onlyNumbers.length <= 6) {
            setTotpCode(onlyNumbers);
            if (errors.totp) {
                setErrors(prev => ({...prev, totp: undefined}));
            }
        }
    }, [errors]);

    // Validate form
    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        if (!formState.email) {
            newErrors.email = t("common.errors.err_email_req");
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
            newErrors.email = t("common.errors.err_email_invalid");
            isValid = false;
        }

        if (!formState.password) {
            newErrors.password = t("common.errors.err_password_req");
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }, [formState]);

    // Handle login with TOTP verification
    const handleSubmitTotp = useCallback(async (e: FormEvent) => {
        e.preventDefault();

        if (!totpCode || totpCode.length !== 6 || !/^\d+$/.test(totpCode)) {
            setErrors({totp:t("common.errors.err_totp_invalid")});
            return;
        }

        try {
            const res = await fetch(baseURL()+"/user/verify-totp?code="+totpCode, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "email": formState.email
                })
            });

            if (!res.ok) {
                const err = await res.json();
                setErrors({totp: err.message || t("common.auth.totp_invalid")});
                setIsLoading(false);
                return;
            }

            router.push("/dashboard");
        } catch (err) {
            setErrors({totp: t("common.errors.err_smth_went_wrong")});
            console.error(err);
        } finally {
            setIsLoading(false);

        }

    }, [totpCode, formState.email, loginResponse, router]);

    // Handle main form submission
    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const { success, error, totp_required } = await login(formState.email, formState.password);

            if (!success) {
                setErrors({ general: error || t("common.errors.err_login_failed") });
                setIsLoading(false);
                return;
            }

            // Check for TOTP requirement
            if (totp_required) {
                setShowTotpVerification(true);
                setIsLoading(false);
                return;
            }

            // If no TOTP required, proceed with navigation
            router.push("/discover");
        } catch (err: any) {
            setErrors({general: t("common.errors.err_smth_went_wrong")});
            setIsLoading(false);
        }
    }, [formState, validateForm, login, router]);

    // If we're showing TOTP verification, display that form
    if (showTotpVerification) {
        return (
            <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                    <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-300" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t("common.auth.verification.title")}</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {t("common.auth.verification.code_prompt")}
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmitTotp} noValidate>
                    <div>
                        <label htmlFor="totp-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("common.auth.verification.code_label")}
                        </label>
                        <input
                            type="text"
                            id="totp-code"
                            name="totpCode"
                            value={totpCode}
                            onChange={handleTotpChange}
                            className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
                                errors.totp ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                            } rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                            placeholder="123456"
                            maxLength={6}
                            aria-invalid={errors.totp ? "true" : "false"}
                            aria-describedby={errors.totp ? "totp-error" : undefined}
                        />
                        {errors.totp && (
                            <p id="totp-error" className="mt-2 text-red-400 text-sm">{errors.totp}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50"
                        aria-busy={isLoading}
                    >
                        {isLoading ? t("common.auth.verification.verifying") : t("common.auth.verification.verify")}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setShowTotpVerification(false);
                            setTotpCode("");
                            setErrors({});
                        }}
                        className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300"
                    >
                        {t("common.auth.back_to_login")}
                    </button>
                </form>
            </div>
        );
    }

    // Default login form
    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t("common.auth.login_title")}</h2>

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("common.auth.email")}
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
                        {t("common.auth.password")}
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
                    {isLoading ? t("common.auth.verification.logging_in") : t("common.auth.login_title")}
                </button>
            </form>

            <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
                {t("common.auth.no_account")+ " "}
                <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    {t("common.auth.signup_title")}
                </Link>
            </p>

            <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
                {t("common.auth.forgot_password") + " "}
                <Link href="/password-reset-request" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    {t("common.auth.change_password_here")}
                </Link>
            </p>
        </div>
    );
};

export default LoginForm;