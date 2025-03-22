// next-i18next.config.mjs

const config = {
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'de'],
        localeDetection: true,
    },
    reloadOnPrerender: process.env.NODE_ENV === 'development',
    debug: process.env.NODE_ENV === 'development',
};

export default config;