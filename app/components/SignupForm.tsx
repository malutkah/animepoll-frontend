"use client"

import Link from "next/link"
import { FormEvent, useState, useCallback, useEffect, memo } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Eye } from "lucide-react";
import { baseURL } from "@/lib/api";
import useTranslation from "@/lib/useTranslation";

interface FormState {
    email: string;
    username: string;
    password: string;
    password2: string;
    betaKey: string;
    acceptLegal: boolean;
}

interface FormErrors {
    email?: string;
    username?: string;
    password?: string;
    password2?: string;
    betaKey?: string;
    acceptLegal?: string;
    general?: string;
}

interface PasswordChecks {
    length: boolean;
    chars: boolean;
    space: boolean;
    digits: boolean;
}

const SignupForm = () => {
    const {t} = useTranslation();
    const betaMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'

    const [formState, setFormState] = useState<FormState>({
        email: '',
        username: '',
        password: '',
        password2: '',
        betaKey: '',
        acceptLegal: false
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const [passwordChecks, setPasswordChecks] = useState<PasswordChecks>({
        length: false,
        chars: false,
        space: true,
        digits: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const passwordMatchColorYes = 'text-green-400';
    const passwordMatchColorNo = 'text-red-400';

    // Check if password is valid based on all criteria
    const isPasswordValid = passwordChecks.length &&
        passwordChecks.chars &&
        passwordChecks.space &&
        passwordChecks.digits;

    // Validate password with all requirements
    const validatePassword = useCallback((pwd: string) => {
        setPasswordChecks({
            length: pwd.length >= 8,
            chars: /[A-Z]/.test(pwd) && /[a-z!?,.#&$'"@;*_]/.test(pwd),
            space: !/\s/.test(pwd),
            digits: /\d/.test(pwd)
        });
    }, []);

    // Handle input changes
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormState(prev => ({ ...prev, [name]: newValue }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }

        // Validate password on change
        if (name === 'password') {
            validatePassword(value);
        }

        // Clear password2 error if password or password2 changes
        if (name === 'password' || name === 'password2') {
            setErrors(prev => ({ ...prev, password2: undefined }));
        }
    }, [errors, validatePassword]);

    // Form validation
    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};
        let valid = true;

        // Username validation
        if (!formState.username) {
            newErrors.username = t("common.errors.err_username_req");
            valid = false;
        }

        // Email validation
        if (!formState.email) {
            newErrors.email = t("common.errors.err_email_req");
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
            newErrors.email = t("common.errors.err_email_invalid");
            valid = false;
        }

        // Password validation
        if (!formState.password) {
            newErrors.password = t("common.errors.err_password_req");
            valid = false;
        } else if (!isPasswordValid) {
            newErrors.password = t("common.errors.err_password_requirements");
            valid = false;
        }

        // Confirm password validation
        if (!formState.password2) {
            newErrors.password2 = t("common.errors.err_confirm_password_req");
            valid = false;
        } else if (formState.password !== formState.password2) {
            newErrors.password2 = t("common.errors.err_password_match");
            valid = false;
        }

        // Beta key validation
        if (betaMode && !formState.betaKey) {
            newErrors.betaKey = t("common.errors.err_beta_key_req");
            valid = false;
        }

        // Legal acceptance validation
        if (!formState.acceptLegal) {
            newErrors.acceptLegal = t("common.errors.err_privacy_policy_req");
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    }, [formState, isPasswordValid, t, betaMode]);

    // Form submission
    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(baseURL() + "/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formState.email,
                    username: formState.username,
                    password: formState.password,
                    beta_key: betaMode ? formState.betaKey : "",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({ general: data.message || t("common.errors.err_smth_went_wrong") });
                setIsLoading(false);
                return;
            }

            // On successful registration, redirect to the success page
            router.push("/signup/success");
        } catch (err: any) {
            setErrors({ general: t("common.errors.err_smth_went_wrong") });
            setIsLoading(false);
        }
    }, [formState, validateForm, router, t, betaMode]);

    // Password visibility toggle handlers
    const handleMouseDown = useCallback(() => setShowPassword(true), []);
    const handleMouseUp = useCallback(() => setShowPassword(false), []);
    const handleMouseDown2 = useCallback(() => setShowPassword2(true), []);
    const handleMouseUp2 = useCallback(() => setShowPassword2(false), []);

    // Element for password criteria check
    const PasswordCriteriaItem = memo(({ passed, text }: { passed: boolean, text: string }) => (
        <p className={`mt-1 text-left ${passed ? passwordMatchColorYes : passwordMatchColorNo} text-sm flex items-center gap-1`}>
            {passed ? <Check className="h-4 w-4"/> : <X className="h-4 w-4"/>}
            <span>{text}</span>
        </p>
    ));

    PasswordCriteriaItem.displayName = 'PasswordCriteriaItem';

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t("common.auth.signup_title")}</h2>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                {/* Username */}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("common.auth.username")}
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formState.username}
                        onChange={handleChange}
                        className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
                            errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                        aria-invalid={errors.username ? "true" : "false"}
                        aria-describedby={errors.username ? "username-error" : undefined}
                    />
                    {errors.username && <p id="username-error" className="mt-2 text-red-400 text-sm">{errors.username}</p>}
                </div>

                {/* Email */}
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
                    {errors.email && <p id="email-error" className="mt-2 text-red-400 text-sm">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("common.auth.password")}
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formState.password}
                            onChange={handleChange}
                            className={`mt-1 block w-full pr-10 px-3 py-2 bg-white dark:bg-gray-800 border ${
                                errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                            } rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                            aria-invalid={errors.password ? "true" : "false"}
                            aria-describedby={errors.password ? "password-error" : undefined}
                        />
                        <button
                            type="button"
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                            aria-label={showPassword ? t("common.auth.hide_password") : t("common.auth.show_password")}
                        >
                            <Eye className="h-5 w-5"/>
                        </button>
                    </div>
                    {errors.password && <p id="password-error" className="mt-2 text-red-400 text-sm">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="password2" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("common.auth.confirm_password")}
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword2 ? "text" : "password"}
                            id="password2"
                            name="password2"
                            value={formState.password2}
                            onChange={handleChange}
                            className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
                                errors.password2 ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                            } rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                            aria-invalid={errors.password2 ? "true" : "false"}
                            aria-describedby={errors.password2 ? "password2-error" : undefined}
                        />
                        <button
                            type="button"
                            onMouseDown={handleMouseDown2}
                            onMouseUp={handleMouseUp2}
                            onMouseLeave={handleMouseUp2}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                            aria-label={showPassword2 ? t("common.auth.hide_password") : t("common.auth.show_password")}
                        >
                            <Eye className="h-5 w-5"/>
                        </button>
                    </div>
                    {errors.password2 && <p id="password2-error" className="mt-2 text-red-400 text-sm">{errors.password2}</p>}

                    <div className="mt-3">
                        <PasswordCriteriaItem
                            passed={passwordChecks.length}
                            text={t("common.auth.password_criteria.length")}
                        />
                        <PasswordCriteriaItem
                            passed={passwordChecks.chars}
                            text={t("common.auth.password_criteria.chars")}
                        />
                        <PasswordCriteriaItem
                            passed={passwordChecks.space}
                            text={t("common.auth.password_criteria.space")}
                        />
                        <PasswordCriteriaItem
                            passed={passwordChecks.digits}
                            text={t("common.auth.password_criteria.digits")}
                        />
                    </div>
                </div>

                {/* Beta Key */}
                {betaMode ? (
                    <div>
                        <label htmlFor="betakey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("common.auth.beta_key")}
                        </label>
                        <input
                            type="password"
                            id="betakey"
                            name="betaKey"
                            value={formState.betaKey}
                            onChange={handleChange}
                            className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
                                errors.betaKey ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                            } rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                            aria-invalid={errors.betaKey ? "true" : "false"}
                            aria-describedby={errors.betaKey ? "betakey-error" : undefined}
                        />
                        {errors.betaKey && <p id="betakey-error" className="mt-2 text-red-400 text-sm">{errors.betaKey}</p>}
                    </div>
                ): null}


                {/* Legal Agreement */}
                <div>
                    <label htmlFor="accept-legal-checkbox" className="flex text-sm font-medium text-gray-700 dark:text-gray-300">
                        <input
                            type="checkbox"
                            id="accept-legal-checkbox"
                            name="acceptLegal"
                            checked={formState.acceptLegal}
                            onChange={handleChange}
                            className={`inline-block mr-4 ${errors.acceptLegal ? 'border-red-500' : ''}`}
                            aria-invalid={errors.acceptLegal ? "true" : "false"}
                            aria-describedby={errors.acceptLegal ? "accept-legal-error" : undefined}
                        />
                        <span>
                            {t("common.auth.privacy_policy")}
                            <Link href="/legal" target="_blank" className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                                {t("common.legal.legal")}
                            </Link>
                        </span>
                    </label>
                    {errors.acceptLegal && <p id="accept-legal-error" className="mt-2 text-red-400 text-sm">{errors.acceptLegal}</p>}
                </div>

                {/* General Error Message */}
                {errors.general && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                        <p>{errors.general}</p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || !isPasswordValid}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50"
                    aria-busy={isLoading}
                >
                    {isLoading ? t("common.auth.signing_up") : t("common.auth.signup_title")}
                </button>
            </form>

            <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
                {t("common.auth.have_account") + " "}
                <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    {t("common.auth.login_title")}
                </Link>
            </p>
        </div>
    );
};

export default SignupForm;