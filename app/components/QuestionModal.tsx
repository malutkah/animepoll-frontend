"use client"

import { useState } from "react"
import { authFetch } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "./ToastProvider"

interface Question {
    id: string
    survey_text: string
    type: string
    possible_answers: string[]
}

interface QuestionModalProps {
    surveyId: string
    question: Question
    onClose: () => void
    onSave: () => void
}

const QuestionModal = ({ surveyId, question, onClose, onSave }: QuestionModalProps) => {
    const [questionText, setQuestionText] = useState(question.survey_text)
    const [questionType, setQuestionType] = useState(question.type)
    const [possibleAnswers, setPossibleAnswers] = useState(question.possible_answers.join(", "))
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { addToast } = useToast()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        let answersArray: string[] = []
        if (questionType === "multiple-choice") {
            answersArray = possibleAnswers.split(",").map(ans => ans.trim()).filter(ans => ans)
            if (answersArray.length === 0) {
                setError("Please provide at least one option for multiple-choice questions.")
                setIsLoading(false)
                return
            }
        }
        try {
            const res = await authFetch(`http://localhost:8080/poll/survey/${surveyId}/questions/${question.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    survey_text: questionText,
                    type: questionType,
                    possible_answers: questionType === "multiple-choice" ? answersArray : [],
                }),
            })
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || "Failed to update question")
                return
            }
            onSave()
        } catch (err) {
            setError("Failed to update question")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 md:w-1/2 p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Edit Question</h2>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium">Question Text</label>
                        <input
                            type="text"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-medium">Question Type</label>
                        <select
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                        >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="text">Text</option>
                        </select>
                    </div>
                    {questionType === "multiple-choice" && (
                        <div>
                            <label className="block font-medium">Possible Answers (comma separated)</label>
                            <input
                                type="text"
                                value={possibleAnswers}
                                onChange={(e) => setPossibleAnswers(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                                required
                            />
                        </div>
                    )}
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        >
                            {isLoading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default QuestionModal
