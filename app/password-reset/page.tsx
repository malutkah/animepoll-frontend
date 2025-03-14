"use client"


import {useRouter, useSearchParams} from "next/navigation";
import {Check, Eye, X} from "lucide-react";
import {FormEvent, memo, useCallback, useState} from "react";
import {baseURL} from "@/lib/api";
interface FormState {
    password: string;
    password2: string;
}

interface FormErrors {
    password?: string;
    password2?: string;
    general?: string;
}

interface PasswordChecks {
    length: boolean;
    chars: boolean;
    space: boolean;
    digits: boolean;
}

function PasswordReset() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [formState, setFormState] = useState<FormState>({
        password: '',
        password2: '',
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

    // Form validation
    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};
        let valid = true;

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

        setErrors(newErrors);
        return valid;
    }, [formState, isPasswordValid]);

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

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();``

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(baseURL() + "/password-reset", {
                method: "POST",
                body: JSON.stringify({"new-password": formState.password})
            })

            const data = await res.json();

            if (!res.ok) {
                setErrors({ general: data.message || "Something went wrong." });
                setIsLoading(false);
                return;
            }
        } catch (err) {
            setErrors({ general: "Something went wrong. Please try again later." });
            setIsLoading(false);
        }

    }, [formState, validateForm, router]);


    // Password visibility toggle handlers
    const handleMouseDown = useCallback(() => setShowPassword(true), []);
    const handleMouseUp = useCallback(() => setShowPassword(false), []);
    const handleMouseDown2 = useCallback(() => setShowPassword2(true), []);
    const handleMouseUp2 = useCallback(() => setShowPassword2(false), []);

    const PasswordCriteriaItem = memo(({ passed, text }: { passed: boolean, text: string }) => (
        <p className={`mt-1 text-left ${passed ? passwordMatchColorYes : passwordMatchColorNo} text-sm flex items-center gap-1`}>
            {passed ? <Check className="h-4 w-4"/> : <X className="h-4 w-4"/>}
            <span>{text}</span>
        </p>
    ));

    PasswordCriteriaItem.displayName = 'PasswordCriteriaItem';

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Reset You Password</h2>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
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
                    {errors.password &&
                        <p id="password-error" className="mt-2 text-red-400 text-sm">{errors.password}</p>}
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
                    {errors.password2 &&
                        <p id="password2-error" className="mt-2 text-red-400 text-sm">{errors.password2}</p>}

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
        </div>
    )
}

export default PasswordReset