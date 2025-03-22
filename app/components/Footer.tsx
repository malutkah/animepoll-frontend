"use client"

import Link from "next/link";
import useTranslation from "@/lib/useTranslation";


const Navbar = () => {
    const {t} = useTranslation()

    return (
        <div className="p-4 flex justify-start gap-8 items-center bg-white dark:bg-gray-800 shadow-md">
            <Link
                href="/legal"
                className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 dark:hover:text-sky-500"
            > {t('common.legal.legal')} </Link>

            <Link
                href="/imprint"
                className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 dark:hover:text-sky-500"
            > {t('common.legal.imprint')} </Link>

            <Link
                href="/contact"
                className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 dark:hover:text-sky-500"
            > {t('common.legal.contact_title')} </Link>
        </div>
    )
}

export default Navbar;
