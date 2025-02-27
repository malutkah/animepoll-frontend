"use client"

import Link from "next/link";


const Navbar = () => {
    return (
        <div className="p-4 flex justify-start gap-8 items-center bg-white dark:bg-gray-800 shadow-md">
            <Link
                href="/legal"
                className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 dark:hover:text-sky-500"
            > Legal </Link>

            <Link
                href="/imprint"
                className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 dark:hover:text-sky-500"
            > Imprint </Link>

            <Link
                href="/contact"
                className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 dark:hover:text-sky-500"
            > Contact Me </Link>
        </div>
    )
}

export default Navbar;
