// lib/LanguageContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

// Define your translations
export const translations = {
    en: {
        common: {
            welcome: "Welcome to AnimePoll",
            subtitle: "Your Voice in the Anime Community",
            login: "Login",
            signup: "Sign Up",
            discover: "Discover Polls",
            dashboard: "Dashboard",
            profile: "Profile",
            logout: "Logout",
            getStarted: "Get Started",
            features: {
                polls: "Create & Participate in Polls",
                pollsDesc: "Engage with the community through interactive polls about your favorite anime series, characters, and more.",
                community: "Join the Discussion",
                communityDesc: "Share your opinions, discover new perspectives, and connect with fellow anime enthusiasts.",
                personalization: "Personalized Experience",
                personalizationDesc: "Get recommendations and discover new anime based on your poll participation and preferences."
            }
        }
    },
    de: {
        common: {
            welcome: "Willkommen bei AnimePoll",
            subtitle: "Deine Stimme in der Anime-Community",
            login: "Anmelden",
            signup: "Registrieren",
            discover: "Umfragen entdecken",
            dashboard: "Dashboard",
            profile: "Profil",
            logout: "Abmelden",
            getStarted: "Loslegen",
            features: {
                polls: "Erstelle & nimm an Umfragen teil",
                pollsDesc: "Engagiere dich in der Community durch interaktive Umfragen über deine Lieblingsanimeserien, Charaktere und mehr.",
                community: "Nimm an Diskussionen teil",
                communityDesc: "Teile deine Meinungen, entdecke neue Perspektiven und vernetze dich mit anderen Anime-Enthusiasten.",
                personalization: "Personalisierte Erfahrung",
                personalizationDesc: "Erhalte Empfehlungen und entdecke neue Anime basierend auf deiner Umfragenteilnahme und deinen Präferenzen."
            }
        }
    }
};

export type Locale = keyof typeof translations;

type LanguageContextType = {
    locale: Locale;
    t: (path: string) => string;
    changeLocale: (newLocale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Default to 'en' initially - will be updated after checking localStorage
    const [locale, setLocale] = useState<Locale>('en');

    useEffect(() => {
        // Only run in the browser
        if (typeof window !== 'undefined') {
            const savedLocale = localStorage.getItem('language') as Locale;
            if (savedLocale && ['en', 'de'].includes(savedLocale)) {
                setLocale(savedLocale);
            } else {
                // Get browser language
                const browserLang = navigator.language.split('-')[0];
                const newLocale = ['en', 'de'].includes(browserLang) ? browserLang as Locale : 'en';
                setLocale(newLocale);
                localStorage.setItem('language', newLocale);
            }
        }
    }, []);

    // Create a memoized translation function
    const t = useMemo(() => {
        return (path: string) => {
            const keys = path.split('.');
            let namespace = keys[0];

            // Handle missing namespace
            if (!translations[locale][namespace]) {
                return path;
            }

            let value: any = translations[locale][namespace];

            // Navigate through the nested objects
            for (let i = 1; i < keys.length; i++) {
                if (!value[keys[i]]) {
                    return path;
                }
                value = value[keys[i]];
            }

            return value;
        };
    }, [locale]);

    // Language change function
    const changeLocale = (newLocale: Locale) => {
        if (['en', 'de'].includes(newLocale) && newLocale !== locale) {
            localStorage.setItem('language', newLocale);
            setLocale(newLocale);
        }
    };

    // Create a memoized context value
    const contextValue = useMemo(() => {
        return { locale, t, changeLocale };
    }, [locale, t]);

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};