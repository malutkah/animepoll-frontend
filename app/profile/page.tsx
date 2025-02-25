"use client"

import React, { useEffect, useState, ChangeEvent } from "react"
import ProtectedRoute from "@/app/components/ProtectedRoute"
import { authFetch } from "@/lib/api"

interface UserProfile {
    username: string;
    email: string;
    country: string;
    age: number;
    gender: string;
    region: string;
    // Optionally, backend may include a profilePicture URL field.
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
    const [countries, setCountries] = useState<Countries[]>([])
    const [profilePic, setProfilePic] = useState<string>("/profile-pic-empty.svg")

    // Simple email validation state (for instant feedback)
    const [emailError, setEmailError] = useState("")

    const fetchProfile = async () => {
        try {
            const res = await authFetch("/user/me")
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
            // If a profile picture URL is provided from backend, use it.
            if(data.profilePicture) {
                setProfilePic(data.profilePicture)
            }
        } catch (err) {
            setError("Failed to load profile")
        }
    }

    const fetchCountries = async () => {
        try {
            const res = await authFetch("/user/countries?fields=name,iso3,emoji,region,subregion")
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

    const handleProfilePicChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0].size > 5242880) {
            alert("File is too big! Max size is 5MB!")
            e.target.files = undefined
            return;
        } else {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onloadend = () => {
                    setProfilePic(reader.result as string);
                }
                reader.readAsDataURL(file);
                // Optionally, you could also send the file to the server here.

                let data = new FormData();
                data.append('file', file)
                const res = await authFetch("/user/upload/profile-picture", {
                    method: "POST",
                    body: data,
                })

                console.log(await res)
            }

        }
    }

    const validateEmail = (value: string) => {
        // Simple email regex check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setEmailError("Please enter a valid email address")
        } else {
            setEmailError("")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if(emailError) return; // Prevent submit if validation error exists
        setIsLoading(true)
        setSuccess('')
        setError('')
        try {
            const res = await authFetch("/user/me", {
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
        const selectedCountry = countries.find((c) => c.name === selected);
        if (selectedCountry) {
            setRegion(selectedCountry.subregion);
        } else {
            setRegion("");
        }
    }

    return (
        <ProtectedRoute>
            <div className="max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}

                {/* Profile Picture Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                        <img src={profilePic} alt="Profile Picture" className="w-full h-full object-cover" />
                    </div>
                    <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleProfilePicChange}
                        className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-900 file:rounded-md file:text-sm file:font-semibold file:bg-blue-600 file:hover:bg-blue-700 file:hover:cursor-pointer"
                    />
                    <p className={"text-gray-500 text-xs"}>Max file size: 5MB</p>
                </div>

                {/* Personal Information Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">Personal Information</h2>
                    <div className="mb-4">
                        <label className="block text-lg font-semibold mb-1">Username</label>
                        <input
                            type="text"
                            value={profile?.username || ""}
                            readOnly
                            className="border p-2 w-full rounded-md shadow-sm bg-gray-600 cursor-not-allowed"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-lg font-semibold mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                validateEmail(e.target.value);
                            }}
                            className="border p-2 w-full rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                        />
                        {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-lg font-semibold mb-1">Country</label>
                        {countries.length > 0 ? (
                            <select
                                value={country}
                                onChange={handleCountryChange}
                                className="border p-2 w-full rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                <option value="">Select a country</option>
                                {countries.map((c) => (
                                    <option key={c.iso3} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-gray-500">Loading countries...</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-lg font-semibold mb-1">Age</label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(Number(e.target.value))}
                            className="border p-2 w-full rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-semibold mb-1">Gender</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="border p-2 w-full rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <option value={"m"}>Male</option>
                            <option value={"f"}>Female</option>
                            <option value={"d"}>Diverse</option>
                        </select>
                    </div>
                </div>

                {/* Account Settings Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">Account Settings</h2>
                    <div className="mb-4">
                        <label className="block text-lg font-semibold mb-1">Region</label>
                        <input
                            type="text"
                            value={region}
                            readOnly
                            className="border p-2 w-full rounded-md shadow-sm bg-gray-600 cursor-not-allowed"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        onClick={handleSubmit}
                        className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors shadow-md"
                    >
                        {isLoading ? "Updating..." : "Update Profile"}
                    </button>
                </div>
            </div>
        </ProtectedRoute>
    )
}

export default ProfilePage
