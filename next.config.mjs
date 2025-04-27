// next.config.mjs

import i18nConfig from './next-i18next.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    i18n: {
        ...i18nConfig.i18n,
        localeDetection: false,
    }

};

export default nextConfig;