"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ProtectedRoute from "../../../components/ProtectedRoute"
import { authFetch } from "@/lib/api"
import { useToast } from "@/app/components/ToastProvider"
import DynamicOptionsInput from "@/app/components/DynamicOptionsInput"
import QuestionModal from "@/app/components/QuestionModal"

interface Survey {
    id: string
    title: string
    description: string
    visibility: string
}

interface Question {
    id: string
    survey_text: string
    type: string
    possible_answers: string[]
}


const EditSurveyPage = () => {
    const params = useParams() as { surveyId: string }
    const router = useRouter()
    const { addToast } = useToast()

    const [survey, setSurvey] = useState<Survey | null>(null)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [visibility, setVisibility] = useState("public")
    const [updateError, setUpdateError] = useState("")
    const [updateLoading, setUpdateLoading] = useState(false)

    // Question creation states
    const [questionText, setQuestionText] = useState("")
    const [questionType, setQuestionType] = useState("multiple-choice")
    // Use dynamic options input for multiple-choice type
    const [options, setOptions] = useState<string[]>([""])
    const [questionError, setQuestionError] = useState("")
    const [questionLoading, setQuestionLoading] = useState(false)

    // Existing questions list
    const [questions, setQuestions] = useState<Question[]>([])
    const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null)
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

    const [disableQuestion, setDisableQuestion] = useState(true)
    const [disableSurvey, setDisableSurvey] = useState(false)

    const disabledButtonClasses = "disabled:bg-gray-600 pointer-events-none"

    const checkVisibility = (value: string) => {
        if (value === 'public' && (!questions || questions.length === 0)) {
            // disable 'update survey'
            setDisableSurvey(true)
        } else {
            setDisableSurvey(false);
        }
        setVisibility(value)
    };

    const fetchSurvey = async () => {
        try {
            const res = await authFetch(`http://localhost:8080/poll/survey/${params.surveyId}`)
            if (!res.ok) {
                const err = await res.json()
                setUpdateError(err.message || "Failed to load survey")
                return
            }
            const data = await res.json()
            setSurvey(data)
            setTitle(data.title)
            setDescription(data.description)
            setVisibility(data.visibility)
        } catch (err) {
            setUpdateError("Failed to load survey")
        }
    }

    const fetchQuestions = async () => {
        try {
            const res = await authFetch(`http://localhost:8080/poll/survey/${params.surveyId}/questions`)
            if (!res.ok) {
                const err = await res.json()
                // Optionally handle error
                return
            }
            const data = await res.json()
            setQuestions(data)
        } catch (err) {
            // Handle error silently
        }
    }

    useEffect(() => {
        fetchSurvey()
        fetchQuestions()
    }, [params.surveyId])

    // Handle survey update
    const handleSurveyUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdateLoading(true)
        setUpdateError("")
        try {
            const res = await authFetch(`http://localhost:8080/poll/survey/${params.surveyId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, visibility }),
            })
            if (!res.ok) {
                const err = await res.json()
                setUpdateError(err.message || "Failed to update survey")
                addToast(err.message || "Failed to update survey", "error")
                return
            }
            addToast("Survey updated successfully", "success")
        } catch (err) {
            setUpdateError("Failed to update survey")
            addToast("Failed to update survey", "error")
        } finally {
            setUpdateLoading(false)
        }
    }

    // Handle question creation
    const handleQuestionCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setQuestionLoading(true)
        setQuestionError("")
        let answersArray: string[] = []
        if (questionType === "multiple-choice") {
            answersArray = options.filter(opt => opt.trim() !== "")
            if (answersArray.length === 0) {
                setQuestionError("Please provide at least one option for multiple-choice questions.")
                setQuestionLoading(false)
                return
            }
        }
        try {
            const res = await authFetch(`http://localhost:8080/poll/survey/${params.surveyId}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    survey_text: questionText,
                    type: questionType,
                    possible_answers: questionType === "multiple-choice" ? answersArray : [],
                }),
            })
            if (!res.ok) {
                const err = await res.json()
                setQuestionError(err.message || "Failed to create question")
                addToast(err.message || "Failed to create question", "error")
                return
            }
            addToast("Question created successfully", "success")
            setQuestionText("")
            setQuestionType("multiple-choice")
            setOptions([""])
            fetchQuestions()
        } catch (err) {
            setQuestionError("Failed to create question")
            addToast("Failed to create question", "error")
        } finally {
            setQuestionLoading(false)
        }
    }

    // Handle deletion of a question
    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm("Are you sure you want to delete this question?")) return
        try {
            const res = await authFetch(`http://localhost:8080/poll/question/${questionId}`, {
                method: "DELETE"
            })
            if (!res.ok) {
                const err = await res.json()
                addToast(err.message || "Failed to delete question", "error")
            } else {
                addToast("Question deleted successfully", "success")
                fetchQuestions()
            }
        } catch (err) {
            addToast("Failed to delete question", "error")
        } finally {
            setActiveContextMenu(null)
        }
    }

    const openEditModal = (question) => {
        setEditingQuestion(question)
        setActiveContextMenu(null)
    }

    return (
        <ProtectedRoute>
            <div className="space-y-8">
                {/* Survey Update Form */}
                <div>
                    <button onClick={() => router.back()} className="mb-4 text-blue-500">
                        Back
                    </button>
                    <h1 className="text-3xl font-bold mb-4">Edit Survey</h1>
                    {updateError && <p className="text-red-500">{updateError}</p>}
                    {survey ? (
                        <form onSubmit={handleSurveyUpdate} className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
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
                                    onChange={(e) => checkVisibility(e.target.value)}
                                    className="border p-2 w-full rounded"
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={updateLoading || disableSurvey}
                                className={`bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded ${disableSurvey ? disabledButtonClasses : ''}`}
                            >
                                {updateLoading ? "Updating..." : "Update Survey"}
                            </button>
                        </form>
                    ) : (
                        <p>Loading survey...</p>
                    )}
                </div>

                {/* Question Creation Form */}
                <div className="border-t pt-8">
                    <h2 className="text-2xl font-bold mb-4">Create New Question</h2>
                    {questionError && <p className="text-red-500">{questionError}</p>}
                    <form onSubmit={handleQuestionCreate} className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                        <div>
                            <label className="block font-medium">Question Text</label>
                            <input
                                type="text"
                                value={questionText}
                                onChange={(e) => {
                                    setDisableQuestion(e.target.value === '')
                                    setQuestionText(e.target.value)
                                }}
                                className="border p-2 w-full rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium">Question Type</label>
                            <select
                                value={questionType}
                                onChange={(e) => setQuestionType(e.target.value)}
                                className="border p-2 w-full rounded"
                            >
                                <option value="multiple-choice">Multiple Choice</option>
                                <option value="text">Text</option>
                            </select>
                        </div>
                        {questionType === "multiple-choice" ? (
                            <DynamicOptionsInput options={options} onChange={setOptions}/>
                        ) : (
                            <div>
                                <label className="block font-medium">Possible Answers (for text questions, leave blank)</label>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={questionLoading || disableQuestion}
                            className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-600 ${disableQuestion ? disabledButtonClasses : ""}`}
                        >
                            {questionLoading ? "Creating..." : "Create Question"}
                        </button>
                    </form>
                </div>

                {/* Existing Questions List */}
                <div className="border-t pt-8">
                    <h2 className="text-2xl font-bold mb-4">Existing Questions</h2>
                    {!questions || questions.length === 0 ? (
                        <p>No questions found.</p>
                    ) : (
                        <ul className="space-y-4">
                            {questions && questions.map((question) => (
                                <li key={question.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow relative">
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{question.survey_text}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Type: {question.type}</p>
                                    {question.type === "multiple-choice" && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Options: {question.possible_answers.join(", ")}
                                        </p>
                                    )}
                                    {/* "..." Button for Context Menu */}
                                    <button
                                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        onClick={() => setActiveContextMenu(activeContextMenu === question.id ? null : question.id)}
                                    >
                                        ⋮
                                    </button>
                                    {activeContextMenu === question.id && (
                                        <div className="absolute top-8 right-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-md z-10">
                                            <button
                                                onClick={() => openEditModal(question)}
                                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                                            >
                                                Edit Question
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuestion(question.id)}
                                                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                                            >
                                                Delete Question
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Edit Question Modal */}
            {editingQuestion && (
                <QuestionModal
                    surveyId={params.surveyId}
                    question={editingQuestion}
                    onClose={() => setEditingQuestion(null)}
                    onSave={() => {
                        setEditingQuestion(null)
                        fetchQuestions()
                        addToast("Question updated successfully", "success")
                    }}
                />
            )}
        </ProtectedRoute>
    )
}

export default EditSurveyPage
