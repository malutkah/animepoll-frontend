// components/LanguageSwitcher.tsx
"use client";

import { useCallback } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, Locale } from '@/lib/LanguageContext';

const LanguageSwitcher = () => {
    const { locale, changeLocale } = useLanguage();

    // Use useCallback to prevent unnecessary renders
    const handleLanguageChange = useCallback((e) => {
        const newLocale = e.target.value as Locale;
        if (newLocale !== locale) {
            changeLocale(newLocale); // Updates context and localStorage
        }
    }, [locale, changeLocale]);

    return (
        <div className="relative inline-block text-left">
            <div className="flex items-center space-x-2 cursor-pointer hover:text-indigo-500">
                <Globe className="h-5 w-5" />
                <select
                    value={locale}
                    onChange={handleLanguageChange}
                    className="bg-transparent border-none outline-none cursor-pointer"
                >
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                </select>
            </div>
        </div>
    );
};

export default LanguageSwitcher;