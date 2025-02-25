"use client"

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {authFetch, baseURL} from "@/lib/api";
import { useToast } from "@/app/components/ToastProvider";
import BarChart from "@/app/components/BarChart";
import { Filter } from "lucide-react";

interface Survey {
    id: string;
    title: string;
    description: string;
    genre_name: string;
    update_timestamp: string;
}

interface AnimeGenre {
    id: string;
    name: string;
}

const DiscoverPage = () => {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [error, setError] = useState("");
    const [genres, setGenres] = useState<AnimeGenre[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

    const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { addToast } = useToast();

    // Fetch surveys for discovery
    const fetchPublicSurveys = async () => {
        try {
            const res = await fetch(baseURL()+"/poll/survey/discover");
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || err.error || "Failed to load public surveys");
                return;
            }
            const data = await res.json();
            setSurveys(data);
        } catch (err) {
            setError("Failed to load public surveys");
        }
    };

    // Fetch available genres
    const fetchAnimeGenres = async () => {
        try {
            const res = await fetch(baseURL()+"/poll/survey/genres");
            if (res.status !== 200) {
                const err = await res.json();
                setError(err.message || "Failed to load genres");
                return;
            }
            const data = await res.json();
            setGenres(data);
        } catch (err) {
            setError("Failed getting genres");
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPublicSurveys();
        fetchAnimeGenres();
    }, []);

    // Filter surveys based on search term and selected genres, then sort by update_timestamp
    const filteredSurveys = surveys
        .filter((survey) => {
            const searchMatch =
                survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                survey.description.toLowerCase().includes(searchTerm.toLowerCase());
            const genreMatch =
                selectedGenres.length === 0 ||
                selectedGenres.includes(survey.genre_name);
            return searchMatch && genreMatch;
        })
        .sort((a, b) => {
            const dateA = new Date(a.update_timestamp).getTime();
            const dateB = new Date(b.update_timestamp).getTime();
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });

    // Handle changes to the genre checkboxes
    const handleGenreCheckboxChange = (genreName: string, checked: boolean) => {
        if (checked) {
            setSelectedGenres((prev) => [...prev, genreName]);
        } else {
            setSelectedGenres((prev) => prev.filter((g) => g !== genreName));
        }
    };

    // Toggle the sort order between newest and oldest
    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
    };

    // Dropdown toggle handler
    const toggleGenreDropdown = () => {
        setGenreDropdownOpen((prev) => !prev);
    };

    // Clear filters and reset sort order to default (newest)
    const clearFilters = () => {
        setSearchTerm("");
        setSelectedGenres([]);
        setSortOrder("newest");
        setGenreDropdownOpen(false);
    };

    // Close dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setGenreDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-white">Discover Polls</h1>
            {error && <p className="text-red-500">{error}</p>}

            {/* Search Bar */}
            <div>
                <input
                    type="text"
                    placeholder="Search surveys..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Genre Filter Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={toggleGenreDropdown}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-gray-800 dark:text-white px-3 py-2 rounded focus:outline-none"
                >
                    <Filter className="h-5 w-5" />
                    <span>Filter by Genre</span>
                </button>
                {genreDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-gray-700 rounded shadow-lg p-4">
                        <p className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                            Select Genres
                        </p>
                        <div className="max-h-48 overflow-y-auto">
                            {genres.map((g) => (
                                <label
                                    key={g.id}
                                    className="flex items-center space-x-2 mb-1 text-gray-700 dark:text-gray-300"
                                >
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-indigo-600"
                                        value={g.name}
                                        onChange={(e) =>
                                            handleGenreCheckboxChange(g.name, e.target.checked)
                                        }
                                        checked={selectedGenres.includes(g.name)}
                                    />
                                    <span>{g.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sorting Toggle & Clear Filter Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-white font-semibold">Sort by Date:</span>
                    <button
                        onClick={toggleSortOrder}
                        className="relative inline-flex items-center h-6 w-11 rounded-full bg-gray-300 dark:bg-gray-600 focus:outline-none"
                    >
            <span
                className={`inline-block w-4 h-4 bg-white rounded-full transform transition-transform ${
                    sortOrder === "newest" ? "translate-x-1" : "translate-x-6"
                }`}
            ></span>
                    </button>
                    <span className="text-white">
            {sortOrder === "newest" ? "Newest First" : "Oldest First"}
          </span>
                </div>
                <button
                    onClick={clearFilters}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                >
                    Clear Filters
                </button>
            </div>

            {/* Display Surveys */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSurveys.length === 0 ? (
                    <p className="text-white">No surveys found.</p>
                ) : (
                    filteredSurveys.map((survey) => (
                        <div
                            key={survey.id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 break-all hover:scale-105 transition-transform duration-200"
                        >
                            <div className="flex justify-end">
                                <p className="pt-0 text-indigo-400 text-sm">{survey.genre_name}</p>
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                                {survey.title}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">
                                {survey.description}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                                Last updated:{" "}
                                {new Date(survey.update_timestamp).toLocaleString()}
                            </p>
                            <div className="mt-4">
                                <Link
                                    href={`/discover/${survey.id}`}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded"
                                >
                                    View Survey
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DiscoverPage;
