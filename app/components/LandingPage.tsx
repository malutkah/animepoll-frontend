"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PollIcon, CommunityIcon, PersonalizationIcon } from "./Icons";

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105">
            <div className="text-4xl mb-4 text-indigo-600 dark:text-indigo-400">{icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </div>
    );
};

const LandingPage = () => {
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            setLoggedIn(!!token);
        }
    }, []);

    const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

    return (
        <div className="text-center">
            {isMaintenance && (
                <div className="bg-orange-300 p-4 mb-4">
                    <marquee className="text-3xl font-bold text-black">
                        The website is currently under maintenance. Some features are temporarily unavailable.
                    </marquee>
                </div>
            )}
            <h1 className="text-5xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                Welcome to <span className="text-indigo-600 dark:text-indigo-400">AnimePoll</span>
            </h1>
            <p className="text-xl mb-12 text-gray-600 dark:text-gray-300">Your Voice in the Anime Community</p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
                <FeatureCard
                    icon={<PollIcon />}
                    title="Create & Participate in Polls"
                    description="Engage with the community through interactive polls about your favorite anime series, characters, and more."
                />
                <FeatureCard
                    icon={<CommunityIcon />}
                    title="Join the Discussion"
                    description="Share your opinions, discover new perspectives, and connect with fellow anime enthusiasts."
                />
                <FeatureCard
                    icon={<PersonalizationIcon />}
                    title="Personalized Experience"
                    description="Get recommendations and discover new anime based on your poll participation and preferences."
                />
            </div>

            <div className="space-x-4">
                <Link
                    href={loggedIn ? "/dashboard" : "/signup"}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 inline-block disabled:bg-gray-600"
                >
                    Get Started
                </Link>
                <Link
                    href={loggedIn ? "/dashboard" : "/login"}
                    className="bg-pink-700 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 inline-block"
                >
                    Login
                </Link>
                <Link
                    href={"/prelaunch-signup"}
                    aria-disabled={true}
                    className="pointer-events-none bg-gray-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 inline-block disabled:bg-gray-600"
                >
                    Sign Up for Pre-Launch
                </Link>
                <Link
                    href="/discover"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 inline-block"
                >
                    Discover Polls
                </Link>
            </div>
        </div>
    );
};

export default LandingPage;
