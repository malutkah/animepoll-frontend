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
            newErrors.username = "Please enter a username";
            valid = false;
        }

        // Email validation
        if (!formState.email) {
            newErrors.email = "Please enter an email";
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
            newErrors.email = "Invalid email format";
            valid = false;
        }

        // Password validation
        if (!formState.password) {
            newErrors.password = "Please enter a password";
            valid = false;
        } else if (!isPasswordValid) {
            newErrors.password = "Password does not meet requirements";
            valid = false;
        }

        // Confirm password validation
        if (!formState.password2) {
            newErrors.password2 = "Please confirm your password";
            valid = false;
        } else if (formState.password !== formState.password2) {
            newErrors.password2 = "Passwords do not match";
            valid = false;
        }

        // Beta key validation
        if (!formState.betaKey) {
            newErrors.betaKey = "Please enter your beta key";
            valid = false;
        }

        // Legal acceptance validation
        if (!formState.acceptLegal) {
            newErrors.acceptLegal = "You must accept the privacy policy";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    }, [formState, isPasswordValid]);

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
                    beta_key: formState.betaKey
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({ general: data.message || "Something went wrong." });
                setIsLoading(false);
                return;
            }

            // On successful registration, redirect to the success page
            router.push("/signup/success");
        } catch (err: any) {
            setErrors({ general: "Something went wrong. Please try again later." });
            setIsLoading(false);
        }
    }, [formState, validateForm, router]);

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
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Sign Up</h2>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                {/* Username */}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
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
                    {errors.email && <p id="email-error" className="mt-2 text-red-400 text-sm">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
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
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            <Eye className="h-5 w-5"/>
                        </button>
                    </div>
                    {errors.password && <p id="password-error" className="mt-2 text-red-400 text-sm">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="password2" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm Password
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
                            aria-label={showPassword2 ? "Hide confirmed password" : "Show confirmed password"}
                        >
                            <Eye className="h-5 w-5"/>
                        </button>
                    </div>
                    {errors.password2 && <p id="password2-error" className="mt-2 text-red-400 text-sm">{errors.password2}</p>}

                    <div className="mt-3">
                        <PasswordCriteriaItem
                            passed={passwordChecks.length}
                            text="Password contains at least 8 characters"
                        />
                        <PasswordCriteriaItem
                            passed={passwordChecks.chars}
                            text="Password contains letters (A-Z, a-z) and allowed characters (!?,.#&$'\@;*#_)"
                        />
                        <PasswordCriteriaItem
                            passed={passwordChecks.space}
                            text="Password does not contain spaces"
                        />
                        <PasswordCriteriaItem
                            passed={passwordChecks.digits}
                            text="Password contains at least one digit (0-9)"
                        />
                    </div>
                </div>

                {/* Beta Key */}
                <div>
                    <label htmlFor="betakey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enter your Beta Key
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
                            By submitting this form, I agree to the
                            <Link href="/legal" target="_blank" className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                                privacy policy
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
                    {isLoading ? "Signing Up..." : "Sign Up"}
                </button>
            </form>

            <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    Login
                </Link>
            </p>
        </div>
    );
};

export default SignupForm;