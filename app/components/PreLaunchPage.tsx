"use client"

import {FormEvent, useState} from "react";
import {Activity, Send, Star, Users} from "lucide-react";

const PreLaunchPage = () => {
    const [submitted, setSubmitted] = useState(false);
    const [email, setEmail] = useState('')
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('t.errorEnterEmail');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('t.errorValidEmail');
            return;
        }

        const res = await fetch("http://localhost:8080/poll/presale/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({email})
        })

        const data = await res;

        if (res.status === 409) {
            const err = await data.json()
            setError(err.message);
        } else {
            setSubmitted(true);
            setError('');
        }
    };

    return (
        <div className="max-w-screen-xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    AnimePoll
                </h1>
                <p className="text-xl md:text-2xl text-indigo-100 mb-8">
                    Your Voice in the Anime Community
                </p>
            </div>

            <div className="max-w-3xl mx-auto text-center mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="flex flex-col items-center">
                        <div className="bg-white/10 p-4 rounded-full mb-4">
                            <Users className="h-8 w-8"/>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Community Driven</h3>
                        <p className="text-indigo-100">Shape the future of anime with your voice</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-white/10 p-4 rounded-full mb-4">
                            <Star className="h-8 w-8"/>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Anime Taste-Map</h3>
                        <p className="text-indigo-100">Find out something new about your taste in anime</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-white/10 p-4 rounded-full mb-4">
                            <Activity className="h-8 w-8"/>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Real-time Insights</h3>
                        <p className="text-indigo-100">Watch community trends evolve live</p>
                    </div>
                </div>
                {/**/}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4">getEarlyAccess</h2>
                    <p className="mb-6 text-indigo-100">
                        launchingMsg
                    </p>

                    {submitted ? (
                        <div className="flex items-center justify-center space-x-2 text-green-400">
                            <Send className="h-5 w-5"/>
                            <span>thankYou</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={'t.placeholderEmail'}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-white/20 focus:ring-2 focus:ring-white/20 focus:outline-none transition-colors"
                                />
                                {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-white text-indigo-600 font-semibold py-3 px-6 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                                {'t.notifyMe'}
                            </button>
                            <p className="text-xs text-indigo-200 mt-4">
                                {'t.privacyNote'}
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PreLaunchPage;