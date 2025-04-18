"use client"

import {FormEvent, useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import {parseJWToken} from "@/lib/utils";
import {authFetch, baseURL, getCSRFToken} from "@/lib/api";
import {cookies} from "next/headers";
import {parseCookie} from "next/dist/compiled/@edge-runtime/cookies";


const ContactPage = () => {
    const [email, setEmail] = useState('')
    const [errorEmail, setErrorEmail] = useState('')

    const [name, setName] = useState('')
    const [errorName, setErrorName] = useState('')

    const [message, setMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const [loggedIn, setLoggedIn] = useState(false)

    const pathname = usePathname()

    const fetchProfile = async () => {
        try {
            const res = await authFetch("/user/me")
            if (!res.ok) {
                const err = await res.json()
                setErrorMessage(err.message || "Failed to load profile")
                return
            }
            const data = await res.json()

            setEmail(data.email)
        } catch (err) {
            setErrorMessage("Failed to load profile")
        }
    }

    useEffect(() => {
        const token = getCSRFToken() != '';
        setLoggedIn(!!token);
    }, [pathname])

    useEffect(() => {
        if (loggedIn) {
            fetchProfile();
        }
    }, [loggedIn]);

    const contactFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const data = {email,name, message}

        console.log('form data', data)

        try {
            const res = await fetch(baseURL()+"/user/contact", {
                method: "POST",
                body: JSON.stringify(data),
            });

            if (res.status === 201) {
                const d = await res.json()
                alert(d.message)
            }

        } catch (err) {
            setMessage(err)
            console.error(err)
        }
    }

    return (
        <div className={"max-w-md mx-auto"}>
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Contact Me</h2>
            <form className={"space-y-4"} onSubmit={contactFormSubmit}>
                <div id={"name-input-div"}>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name-input"
                        name="name"
                        value={name}
                        required
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errorName && <p className="mt-2 text-red-400 text-sm">{errorName}</p>}
                </div>

                <div id={"email-input-div"}>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        required
                        readOnly={loggedIn}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errorEmail && <p className="mt-2 text-red-400 text-sm">{errorEmail}</p>}
                </div>

                <div id={"message-input-div"}>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Your Message:
                    </label>
                    <textarea
                        id="message-textarea"
                        name="message"
                        value={message}
                        required
                        onChange={(e) => setMessage(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errorMessage && <p className="mt-2 text-red-400 text-sm">{errorMessage}</p>}
                </div>

                <button
                    type="submit"
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50"
                >
                    Send Message
                </button>
            </form>
        </div>
    )
}

export default ContactPage;
