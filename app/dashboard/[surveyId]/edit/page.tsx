"use client"

import React, {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import {authFetch, baseURL} from "@/lib/api";
import {useToast} from "@/app/components/ToastProvider";
import { useMessage } from "@/app/components/MessageBoxExport";
import DynamicOptionsInput from "@/app/components/DynamicOptionsInput";
import QuestionModal from "@/app/components/QuestionModal";
import {InfoIcon, ClockIcon, Calendar} from "lucide-react";
import DateTimePicker from "@/app/components/DateTimePicker";
import useTranslation from "@/lib/useTranslation";

interface Survey {
    id: string;
    title: string;
    description: string;
    visibility: string;
    genre_id: string;
    start_date?: string;
    end_date?: string;
}

interface Question {
    id: string;
    survey_text: string;
    type: string;
    possible_answers: any;
}

interface AnimeGenre {
    id: string;
    name: string;
}

type AnimeGenres = AnimeGenre[];

const EditSurveyPage = () => {
    const params = useParams() as { surveyId: string };
    const router = useRouter();
    const {addToast} = useToast();
    const { showMessage } = useMessage();

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState("public");
    const [updateError, setUpdateError] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);

    // DateTime fields
    const [enableTimeframe, setEnableTimeframe] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Question creation states
    const [questionText, setQuestionText] = useState("");
    const [questionType, setQuestionType] = useState("multiple-choice");
    const [options, setOptions] = useState<string[]>([""]);
    const [questionError, setQuestionError] = useState("");
    const [questionLoading, setQuestionLoading] = useState(false);

    // New rating settings for question creation
    const [ratingRange, setRatingRange] = useState(5);
    const [ratingDisplayType, setRatingDisplayType] = useState("star");
    const [ratingAllowHalfSteps, setRatingAllowHalfSteps] = useState(false);
    const [ratingMinText, setRatingMinText] = useState("Very bad");
    const [ratingMaxText, setRatingMaxText] = useState("Perfect");

    // Existing questions list
    const [questions, setQuestions] = useState<Question[]>([]);
    const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    const [disableQuestion, setDisableQuestion] = useState(true);
    const [disableSurveyUpdate, setDisableSurveyUpdate] = useState(false);

    // Genre states
    const [genres, setGenres] = useState<AnimeGenres>([]);
    const [genreId, setGenreId] = useState("");
    const [genre, setGenre] = useState("");

    const {t} = useTranslation();

    const disabledButtonClasses = "disabled:bg-gray-600 pointer-events-none";

    const fetchAnimeGenres = async () => {
        try {
            const res = await fetch(baseURL() + "/poll/survey/genres");
            if (res.status !== 200) {
                const err = await res.json();
                setUpdateError(err.message || t("common.errors.err_get_genres"));
                return;
            }
            const data = await res.json();
            setGenres(data);
        } catch (err) {
            setUpdateError(t("common.errors.err_get_genres"));
            console.error(err);
        }
    };

    const handleGenreSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        const selectedGenre = genres.find((g) => g.name === selected);
        if (selectedGenre) {
            setGenre(selectedGenre.name);
            setGenreId(selectedGenre.id);
        } else {
            setGenre("");
            setGenreId("");
        }
    };

    const checkVisibility = (value: string) => {
        if (value === "public" && (!questions || questions.length === 0)) {
            setDisableSurveyUpdate(true);
        } else {
            setDisableSurveyUpdate(false);
        }
        setVisibility(value);
    };

    const fetchSurvey = async () => {
        try {
            const res = await authFetch(`/poll/survey/${params.surveyId}`);
            if (!res.ok) {
                const err = await res.json();
                setUpdateError(err.message || t("common.errors.err_survey_load"));
                return;
            }
            const data = await res.json();
            setSurvey(data);
            setTitle(data.title);
            setDescription(data.description);
            setVisibility(data.visibility);
            setGenreId(data.genre_id);

            // Handle start and end dates if they exist
            if (data.start_date) {
                setEnableTimeframe(true);
                setStartDate(new Date(data.start_date));
            }
            if (data.end_date) {
                setEnableTimeframe(true);
                setEndDate(new Date(data.end_date));
            }
        } catch (err) {
            setUpdateError(t("common.errors.err_survey_load"));
        }
    };

    const fetchQuestions = async () => {
        try {
            const res = await authFetch(`/poll/survey/${params.surveyId}/questions`);
            if (!res.ok) {
                const err = await res.json();
                setUpdateError(err.message || t("common.errors.err_questions_load"))
                return;
            }
            const data = await res.json();
            setQuestions(data);
        } catch (err) {
            // Handle error silently
            setUpdateError(err);
        }
    };

    // When both survey and genres are loaded, update the genre select with the saved genre.
    useEffect(() => {
        if (survey && genres.length > 0) {
            const savedGenre = genres.find((g: AnimeGenre) => g.id === survey.genre_id);
            if (savedGenre) {
                setGenre(savedGenre.name);
            }
        }
    }, [survey, genres]);

    useEffect(() => {
        fetchSurvey();
        fetchQuestions();
        fetchAnimeGenres();
    }, [params.surveyId]);

    // Handle survey update
    const handleSurveyUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateLoading(true);
        setUpdateError("");

        // Prepare update payload
        const updatePayload: any = {
            title,
            description,
            visibility,
            genre_id: genreId
        };

        // Only include date fields if timeframe is enabled
        if (enableTimeframe) {
            if (startDate) {
                updatePayload.start_date = startDate.toISOString();
            }
            if (endDate) {
                updatePayload.end_date = endDate.toISOString();
            }
        } else {
            // Set dates to null if timeframe is disabled
            updatePayload.start_date = "";
            updatePayload.end_date = "";
        }

        try {
            const res = await authFetch(`/poll/survey/${params.surveyId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(updatePayload),
            });
            if (!res.ok) {
                const err = await res.json();
                setUpdateError(err.message || t("common.errors.err_survey_update"));
                showMessage({
                    type: 'error',
                    title: t("common.errors.err_occurred"),
                    message: err.message || t("common.errors.err_survey_update"),
                    showIcon: true,
                    autoClose: true
                });
                return;
            }

            showMessage({
                type: 'success',
                title: t("common.success.succ_survey_updated"),
                message: t("common.success.succ_survey_updated"),
                showIcon: true,
                autoClose: true
            });
        } catch (err) {
            setUpdateError(t("common.errors.err_survey_update"));
            showMessage({
                type: 'error',
                title: t("common.errors.err_occurred"),
                message: t("common.errors.err_survey_update"),
                showIcon: true,
                autoClose: true
            });
        } finally {
            setUpdateLoading(false);
        }
    };

    // Handle question creation
    const handleQuestionCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setQuestionLoading(true);
        setQuestionError("");

        if (!questionText.trim()) {
            setQuestionError(t("common.errors.err_empty_fields"));
            showMessage({
                type: 'warning',
                message: t("common.errors.err_empty_fields"),
                showIcon: true,
                autoClose: true
            });
            setQuestionLoading(false);
            return;
        }

        let possibleAnswersArray: string[] = [];
        if (questionType === "multiple-choice") {
            possibleAnswersArray = options.filter(opt => opt.trim() !== "");
            if (possibleAnswersArray.length === 0) {
                setQuestionError(t("common.survey.no_options"));
                showMessage({
                    type: 'warning',
                    message: t("common.survey.no_options"),
                    showIcon: true,
                    autoClose: true
                });
                setQuestionLoading(false);
                return;
            }
        } else if (questionType === "rating") {
            // Validate rating settings
            if (!ratingMinText.trim() || !ratingMaxText.trim()) {
                setQuestionError(t("common.errors.err_empty_fields"));
                showMessage({
                    type: 'warning',
                    message: t("common.errors.err_empty_fields"),
                    showIcon: true,
                    autoClose: true
                });
                setQuestionLoading(false);
                return;
            }
            possibleAnswersArray = [JSON.stringify({
                range: ratingRange,
                displayType: ratingDisplayType,
                allowHalfSteps: (ratingDisplayType === "star" || ratingDisplayType === "slider") ? ratingAllowHalfSteps : false,
                minText: ratingMinText,
                maxText: ratingMaxText,
            })];
        }

        try {
            const res = await authFetch(`/poll/survey/${params.surveyId}/questions`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    survey_text: questionText,
                    type: questionType,
                    possible_answers: questionType === "multiple-choice" ? possibleAnswersArray : (questionType === "rating" ? possibleAnswersArray : []),
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                setQuestionError(err.message || t("common.errors.err_question_create"));
                showMessage({
                    type: 'error',
                    title: t("common.errors.err_occurred"),
                    message: err.message || t("common.errors.err_question_create"),
                    showIcon: true,
                    autoClose: true
                });
                return;
            }

            showMessage({
                type: 'success',
                title: t("common.success.succ_question_created"),
                message: t("common.success.succ_question_created"),
                showIcon: true,
                autoClose: true
            });

            setQuestionText("");
            setQuestionType("multiple-choice");
            setOptions([""]);
            // Reset rating settings to defaults
            setRatingRange(5);
            setRatingDisplayType("star");
            setRatingAllowHalfSteps(false);
            setRatingMinText(t("common.survey.min_label"));
            setRatingMaxText(t("common.survey.max_label"));
            fetchQuestions();
        } catch (err) {
            setQuestionError(t("common.errors.err_question_create"));
            showMessage({
                type: 'error',
                title: t("common.errors.err_occurred"),
                message: t("common.errors.err_question_create"),
                showIcon: true,
                autoClose: true
            });
        } finally {
            setQuestionLoading(false);
        }
    };

    // Handle deletion of a question
    const handleDeleteQuestion = async (questionId: string) => {
        const messageId = showMessage({
            type: 'question',
            title: t("common.delete"),
            message: t("common.msg_confirm.delete_question"),
            onConfirm: async () => {
                try {
                    const res = await authFetch(`/poll/question/${questionId}`, {
                        method: "DELETE",
                    });
                    if (!res.ok) {
                        const err = await res.json();
                        showMessage({
                            type: 'error',
                            title: t("common.errors.err_deletion"),
                            message: err.message || t("common.errors.err_occurred"),
                            showIcon: true,
                            autoClose: true
                        });
                    } else {
                        showMessage({
                            type: 'success',
                            title: t("common.success.succ_question_deleted"),
                            message: t("common.success.succ_question_deleted"),
                            showIcon: true,
                            autoClose: true
                        });
                        fetchQuestions();
                        fetchSurvey();
                    }
                } catch (err) {
                    showMessage({
                        type: 'error',
                        title: t("common.errors.err_deletion"),
                        message: t("common.errors.err_occurred"),
                        showIcon: true,
                        autoClose: true
                    });
                } finally {
                    setActiveContextMenu(null);
                }
            },
            onCancel: () => {
                setActiveContextMenu(null);
            },
            confirmText: t("common.delete"),
            cancelText: t("common.cancel"),
            showIcon: true,
            showCloseButton: false,
        });
    };

    const openEditModal = (question: Question) => {
        setEditingQuestion(question);
        setActiveContextMenu(null);
    };

    // Validate that end date is after start date
    const validateDateRange = () => {
        if (enableTimeframe && startDate && endDate) {
            if (endDate.getTime() <= startDate.getTime()) {
                showMessage({
                    type: 'error',
                    title: t("common.errors.err_occurred"),
                    message: t("common.timeframe.date_range_error"),
                    showIcon: true,
                    autoClose: true
                });
                return false;
            }
        }
        return true;
    };

    // Toggle the timeframe feature
    const handleToggleTimeframe = () => {
        if (!enableTimeframe) {
            // If enabling, set default values
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            setStartDate(oneHourLater);
            setEndDate(oneWeekLater);
        }
        setEnableTimeframe(!enableTimeframe);
    };

    // Minimum selectable date (now + 1 hour)
    const minDate = new Date(new Date().getTime() + 60 * 60 * 1000);

    return (
        <ProtectedRoute>
            <div className="space-y-8">
                {/* Survey Update Form */}
                <div>
                    <button onClick={() => router.back()} className="mb-4 text-blue-500">
                        {t("common.back")}
                    </button>
                    <h1 className="text-3xl font-bold mb-4">{t("common.survey.edit_survey")}</h1>
                    {updateError && <p className="text-red-500">{updateError}</p>}
                    {survey ? (
                        <form onSubmit={handleSurveyUpdate}
                              className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                            <div>
                                <label className="block font-medium">{t("common.survey.title")}</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="border p-2 w-full rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-medium">{t("common.survey.description")}</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="border p-2 w-full rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-medium">{t("common.survey.genre")}</label>
                                {genres && genres.length > 0 ? (
                                    <select
                                        value={genre}
                                        onChange={handleGenreSelect}
                                        className="border p-2 w-full rounded"
                                        required
                                    >
                                        <option value={""}>{t("common.survey.select_genre")}</option>
                                        {genres.map((g) => (
                                            <option key={g.id} value={g.name}>
                                                {g.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p>{t("common.loading")}</p>
                                )}
                            </div>

                            {/* Timeframe section */}
                            <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ClockIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        <label className="text-lg font-medium">{t("common.timeframe.survey_timeframe")}</label>
                                    </div>
                                    <div className="flex items-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={enableTimeframe}
                                                onChange={handleToggleTimeframe}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                {enableTimeframe ? t("common.timeframe.enabled") : t("common.timeframe.disabled")}
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {enableTimeframe && (
                                    <div className="space-y-4 mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t("common.timeframe.timeframe_description")}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block font-medium mb-2 flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {t("common.timeframe.start_date")}
                                                </label>
                                                <DateTimePicker
                                                    value={startDate}
                                                    onChange={setStartDate}
                                                    minDate={minDate}
                                                    placeholder={t("common.timeframe.select_start")}
                                                />
                                            </div>

                                            <div>
                                                <label className="block font-medium mb-2 flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {t("common.timeframe.end_date")}
                                                </label>
                                                <DateTimePicker
                                                    value={endDate}
                                                    onChange={setEndDate}
                                                    minDate={startDate || minDate}
                                                    placeholder={t("common.timeframe.select_end")}
                                                    disabled={!startDate}
                                                />
                                                {!startDate && (
                                                    <p className="text-xs text-amber-500 mt-1">
                                                        {t("common.timeframe.select_first")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {startDate && endDate && (
                                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">
                                                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                                    {t("common.timeframe.active_period").replace('{0}', startDate.toLocaleString()).replace('{1}', endDate.toLocaleString())}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block font-medium">{t("common.survey.visibility")}</label>
                                <select
                                    value={visibility}
                                    onChange={(e) => checkVisibility(e.target.value)}
                                    className="border p-2 w-full rounded"
                                >
                                    <option value="public">{t("common.survey.public")}</option>
                                    <option value="private">{t("common.survey.private")}</option>
                                </select>
                                {disableSurveyUpdate ? (
                                    <span className={"flex align-middle mt-4"}>
                                        <InfoIcon className={"text-orange-400 mr-4"}/>
                                        <p className={"text-orange-400"}>{t("common.survey.cant_set_public")}</p>
                                    </span>
                                ) : null}
                            </div>

                            {enableTimeframe && (!startDate || !endDate) && (
                                <div className="flex items-center text-amber-600 dark:text-amber-400 mt-2">
                                    <InfoIcon className="h-5 w-5 mr-2" />
                                    <p>{t("common.timeframe.both_dates_required")}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                id={"btn-survey-update"}
                                disabled={updateLoading || disableSurveyUpdate || (enableTimeframe && (!startDate || !endDate))}
                                className={`bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded ${
                                    disableSurveyUpdate || (enableTimeframe && (!startDate || !endDate)) ? disabledButtonClasses : ""
                                }`}
                                onClick={(e) => {
                                    if (enableTimeframe && !validateDateRange()) {
                                        e.preventDefault();
                                        return;
                                    }
                                }}
                            >
                                {updateLoading ? t("common.updating") : t("common.survey.update_survey")}
                            </button>
                        </form>
                    ) : (
                        <p>{t("common.loading")}</p>
                    )}
                </div>

                {/* Question Creation Form */}
                <div className="border-t pt-8">
                    <h2 className="text-2xl font-bold mb-4">{t("common.survey.create_question")}</h2>
                    {questionError && <p className="text-red-500">{questionError}</p>}
                    <form onSubmit={handleQuestionCreate}
                          className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                        <div>
                            <label className="block font-medium">{t("common.survey.question_text")}</label>
                            <input
                                type="text"
                                value={questionText}
                                onChange={(e) => {
                                    setDisableQuestion(e.target.value === "");
                                    setQuestionText(e.target.value);
                                }}
                                className="border p-2 w-full rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium">{t("common.survey.question_type")}</label>
                            <select
                                value={questionType}
                                onChange={(e) => setQuestionType(e.target.value)}
                                className="border p-2 w-full rounded"
                            >
                                <option value="multiple-choice">{t("common.survey.multiple_choice")}</option>
                                <option value="text">{t("common.survey.text")}</option>
                                <option value="rating">{t("common.survey.rating")}</option>
                            </select>
                        </div>
                        {questionType === "multiple-choice" && (
                            <DynamicOptionsInput options={options} onChange={setOptions} maxOptions={5}/>
                        )}
                        {questionType === "rating" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-medium">{t("common.survey.rating_range")}</label>
                                    <select
                                        value={ratingRange}
                                        onChange={(e) => setRatingRange(Number(e.target.value))}
                                        className="border p-2 w-full rounded"
                                    >
                                        <option value={5}>1 - 5</option>
                                        <option value={10}>1 - 10</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-medium">{t("common.survey.display_type")}</label>
                                    <select
                                        value={ratingDisplayType}
                                        onChange={(e) => setRatingDisplayType(e.target.value)}
                                        className="border p-2 w-full rounded"
                                    >
                                        <option value="star">{t("common.survey.star_rating")}</option>
                                        <option value="slider">{t("common.survey.slider")}</option>
                                        <option value="radio">{t("common.survey.radio_buttons")}</option>
                                    </select>
                                </div>
                                {(ratingDisplayType === "star" || ratingDisplayType === "slider") && (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={ratingAllowHalfSteps}
                                            onChange={(e) => setRatingAllowHalfSteps(e.target.checked)}
                                            className="form-checkbox h-5 w-5 text-indigo-600"
                                        />
                                        <span className="text-sm">{t("common.survey.allow_half_steps")}</span>
                                    </div>
                                )}
                                <div>
                                    <label className="block font-medium">{t("common.survey.min_label")}</label>
                                    <input
                                        type="text"
                                        value={ratingMinText}
                                        onChange={(e) => setRatingMinText(e.target.value)}
                                        className="border p-2 w-full rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium">{t("common.survey.max_label")}</label>
                                    <input
                                        type="text"
                                        value={ratingMaxText}
                                        onChange={(e) => setRatingMaxText(e.target.value)}
                                        className="border p-2 w-full rounded"
                                    />
                                </div>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={questionLoading || disableQuestion}
                            className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-600 ${disableQuestion ? disabledButtonClasses : ""}`}
                        >
                            {questionLoading ? t("common.creating") : t("common.survey.create_question")}
                        </button>
                    </form>
                </div>

                {/* Existing Questions List */}
                <div className="border-t pt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">{t("common.survey.questions")}</h2>
                        <div className="text-sm bg-indigo-100 dark:bg-indigo-900/30 py-1 px-3 rounded-full">
                            <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                                {t("common.survey.question_count").replace('{0}',questions.length.toString())}
                            </span>
                        </div>
                    </div>

                    {!questions || questions.length === 0 ? (
                        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">{t("common.survey.no_questions")}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("common.survey.create_first_question")}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                            {questions.map((question, index) => (
                                <div
                                    key={question.id}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                                >
                                    <div className="relative flex justify-between items-center bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-100 dark:border-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <span className="flex items-center justify-center w-6 h-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            <span className="font-medium text-gray-700 dark:text-gray-100">
                                                {question.type === "multiple-choice" ? t("common.survey.multiple_choice") :
                                                    question.type === "rating" ? t("common.survey.rating") : t("common.survey.text")}
                                            </span>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => openEditModal(question)}
                                                className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                                                title={t("common.edit")}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuestion(question.id)}
                                                className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                                                title={t("common.delete")}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <p className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
                                            {question.survey_text}
                                        </p>

                                        {question.type === "multiple-choice" && (
                                            <div className="space-y-2 mt-3">
                                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{t("common.survey.possible_answers")}:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {question.possible_answers.map((option: string, i: number) => (
                                                        <span
                                                            key={i}
                                                            className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full px-3 py-1 text-sm"
                                                        >
                                                            {option}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {question.type === "rating" && (
                                            <div className="space-y-2 mt-3">
                                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{t("common.survey.rating_config")}:</p>
                                                {(() => {
                                                    try {
                                                        const config = JSON.parse(JSON.parse(question.possible_answers)[0]);
                                                        return (
                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                                                    <span className="block text-gray-500 dark:text-gray-400">{t("common.survey.display_type")}:</span>
                                                                    <span className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                                                                        {config.displayType === "star" ? t("common.survey.star_rating") :
                                                                            config.displayType === "slider" ? t("common.survey.slider") :
                                                                                t("common.survey.radio_buttons")}
                                                                    </span>
                                                                </div>
                                                                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                                                    <span className="block text-gray-500 dark:text-gray-400">{t("common.survey.rating_range")}:</span>
                                                                    <span className="font-medium text-gray-800 dark:text-gray-200">1-{config.range}</span>
                                                                </div>
                                                                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                                                    <span className="block text-gray-500 dark:text-gray-400">{t("common.survey.min_label")}:</span>
                                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{config.minText}</span>
                                                                </div>
                                                                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                                                    <span className="block text-gray-500 dark:text-gray-400">{t("common.survey.max_label")}:</span>
                                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{config.maxText}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    } catch (e) {
                                                        return <p className="text-sm text-red-500">{t("common.errors.err_parsing_config")}</p>;
                                                    }
                                                })()}
                                            </div>
                                        )}

                                        {question.type === "text" && (
                                            <div className="mt-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                                                <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                                                    {t("common.survey.text_response_description")}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {editingQuestion && (
                <QuestionModal
                    surveyId={params.surveyId}
                    question={editingQuestion}
                    onClose={() => setEditingQuestion(null)}
                    onSave={() => {
                        setEditingQuestion(null)
                        fetchQuestions()
                        addToast(t("common.success.succ_question_updated"), "success")
                    }}
                />
            )}
        </ProtectedRoute>
    );
};

export default EditSurveyPage;