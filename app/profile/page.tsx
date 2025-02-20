"use client"

import React, { useEffect, useState } from "react"
import ProtectedRoute from "../components/ProtectedRoute"
import { authFetch } from "@/lib/api"

interface UserProfile {
    username: string;
    email: string;
    country: string;
    age: number;
    gender: string;
    region: string;
}

interface Countries {
    name: string;
    iso3: string;
    region: string;
    subregion: string;
    emojiU: string;
}

const ProfilePage = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [email, setEmail] = useState('')
    const [country, setCountry] = useState('')
    const [age, setAge] = useState<number | ''>('')
    const [gender, setGender] = useState('')
    const [region, setRegion] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const [countries, setCountries] = useState<Countries[] | []>([])

    const fetchProfile = async () => {
        try {
            const res = await authFetch("http://localhost:8080/user/me")
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || "Failed to load profile")
                return
            }
            const data = await res.json()
            setProfile(data)
            setEmail(data.email)
            setCountry(data.country)
            setAge(data.age)
            setGender(data.gender)
            setRegion(data.region)
        } catch (err) {
            setError("Failed to load profile")
        }
    }

    const fetchCountries = async () => {
        try {
            const res = await authFetch("http://localhost:8080/user/countries?fields=name,iso3,emoji,region,subregion")
            if (res.status !== 200) {
                const err = await res.json();
                setError(err.message || "Failed to load countries");
                return;
            }
            const data = await res.json();
            setCountries(data)

        } catch (err) {
            console.error(err)
            setError("Failed to load countries.")
        }
    }

    useEffect(() => {
        fetchProfile()
        fetchCountries()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setSuccess('')
        try {
            const res = await authFetch("http://localhost:8080/user/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, country, age, gender, region })
            })
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || "Failed to update profile")
                return
            }
            setSuccess("Profile updated successfully")
        } catch (err) {
            setError("Failed to update profile")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        setCountry(selected);

        //@ts-ignore
        const selectedCountry = countries.find((c) => c.name === selected);
        if (selectedCountry) {
            setRegion(selectedCountry.subregion);
        } else {
            setRegion("");
        }
    }

    return (
        <ProtectedRoute>
            <div>
                <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
                {profile ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div id={"profile-image-div"} className={"rounded mx-auto flex justify-center"}>
                            <img src={"/profile-pic-empty.svg"} alt={"profile-image"} className={"max-w-48 min-h-48"} />
                        </div>
                        <div>
                            <label className="block">Username</label>
                            <input type="text" value={profile.username} readOnly className="border p-2 w-full bg-gray-800 rounded" />
                        </div>
                        <div>
                            <label className="block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border p-2 w-full rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block">Country</label>
                            {countries && countries.length > 0 ? (
                                <select
                                    value={country}
                                    onChange={handleCountryChange}
                                    className="border p-2 w-full rounded"
                                >
                                    <option value="">Select a country</option>
                                    {countries.map((c) => (
                                        <option key={c.iso3} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p>Loading countries...</p>
                            )}
                        </div>
                        <div>
                            <label className="block">Age</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(Number(e.target.value))}
                                className="border p-2 w-full rounded"
                            />
                        </div>
                        <div>
                            <label className="block">Gender</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="border p-2 w-full rounded"
                            >
                                <option value={"m"}>Male</option>
                                <option value={"f"}>Female</option>
                                <option value={"d"}>Diverse</option>
                            </select>
                        </div>
                        <div>
                            <label className="block">Region</label>
                            <input
                                type="text"
                                value={region}
                                readOnly
                                onChange={(e) => setRegion(e.target.value)}
                                className="border p-2 w-full bg-gray-800 rounded"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        >
                            {isLoading ? "Updating..." : "Update Profile"}
                        </button>
                    </form>
                ) : (
                    <p>Loading profile...</p>
                )}
            </div>
        </ProtectedRoute>
    )
}

export default ProfilePage
