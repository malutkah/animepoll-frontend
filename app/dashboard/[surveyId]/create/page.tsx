"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "../../components/ProtectedRoute"
import { authFetch } from "@/lib/api"
import { useToast } from "@/app/components/ToastProvider"

const CreateSurveyPage = () => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [visibility, setVisibility] = useState('public')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { addToast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const res = await authFetch("http://localhost:8080/poll/survey", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, visibility })
            })
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || "Failed to create survey")
                addToast(err.message || "Failed to create survey", "error")
                return
            }
            addToast("Survey created successfully", "success")
            router.push("/dashboard")
        } catch (err) {
            setError("Failed to create survey")
            addToast("Failed to create survey", "error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ProtectedRoute>
            <div>
                <h1 className="text-3xl font-bold mb-4">Create New Survey</h1>
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border p-2 w-full rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-medium">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border p-2 w-full rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-medium">Visibility</label>
                        <select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                            className="border p-2 w-full rounded"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    >
                        {isLoading ? "Creating..." : "Create Survey"}
                    </button>
                </form>
            </div>
        </ProtectedRoute>
    )
}

export default CreateSurveyPage
