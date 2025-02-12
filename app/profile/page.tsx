"use client"

import { useEffect, useState } from "react"
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

    useEffect(() => {
        fetchProfile()
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

    return (
        <ProtectedRoute>
            <div>
                <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
                {profile ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block">Username</label>
                            <input type="text" value={profile.username} readOnly className="border p-2 w-full bg-gray-200" />
                        </div>
                        <div>
                            <label className="block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border p-2 w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block">Country</label>
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="border p-2 w-full"
                            />
                        </div>
                        <div>
                            <label className="block">Age</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(Number(e.target.value))}
                                className="border p-2 w-full"
                            />
                        </div>
                        <div>
                            <label className="block">Gender</label>
                            <input
                                type="text"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="border p-2 w-full"
                            />
                        </div>
                        <div>
                            <label className="block">Region</label>
                            <input
                                type="text"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="border p-2 w-full"
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
