// lib/useTranslation.ts
"use client";

import {useLanguage} from "@/lib/LanguageContext";

export default function useTranslation() {
    const { locale, t, changeLocale } = useLanguage();

    return { t, locale, changeLocale };
}