"use client"

import React, {useEffect, useState, ChangeEvent} from "react"
import ProtectedRoute from "@/app/components/ProtectedRoute"
import {authFetch, baseURL} from "@/lib/api"
import Link from "next/link";
import ModalBox from "@/app/components/ModalBox";
import useTranslation from "@/lib/useTranslation";

interface UserProfile {
    username: string;
    email: string;
    country: string;
    age: number;
    gender: string;
    region: string;
    totp_activated: boolean;
    // Optionally, backend may include a profilePicture URL field.
}

interface Countries {
    name: string;
    iso3: string;
    region: string;
    subregion: string;
    emojiU: string;
    translations: any;
}

const ProfilePage = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [email, setEmail] = useState('')
    const [country, setCountry] = useState('')
    const [age, setAge] = useState<number | ''>('')
    const [gender, setGender] = useState('')
    const [region, setRegion] = useState('')
    const [translations, setTranslations] = useState({})
    const [totpActivated, setTotpActivated] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [countries, setCountries] = useState<Countries[]>([])
    const [profilePic, setProfilePic] = useState<string>("/profile-pic-empty.svg")
    const [openModalBox, setOpenModalBox] = useState<any>(undefined)

    const { t, locale } = useTranslation();

    // Simple email validation state (for instant feedback)
    const [emailError, setEmailError] = useState("")

    const fetchProfile = async () => {
        try {
            const res = await authFetch("/user/me")
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || t('common.error.err_get_profile'))
                return
            }
            const data = await res.json()
            setProfile(data)
            setEmail(data.email)
            setCountry(data.country)
            setAge(data.age)
            setGender(data.gender)
            setRegion(data.region)
            setTotpActivated(data.totp_activated)

            // If a profile picture URL is provided from backend, use it.
            if (data.profilePicture) {
                setProfilePic(data.profilePicture)
            }
        } catch (err) {
            setError(t('common.errors.err_get_profile'))
        }
    }

    const fetchCountries = async () => {
        try {
            const res = await authFetch("/user/countries?fields=name,iso3,emoji,region,subregion,translations")
            if (res.status !== 200) {
                const err = await res.json();
                setError(err.message || t('common.errors.err_countries'));
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
            setEmailError(t('common.errors.err_invalid_email'))
        } else {
            setEmailError("")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (emailError) return; // Prevent submit if validation error exists
        setIsLoading(true)
        setSuccess('')
        setError('')
        try {
            const res = await authFetch("/user/me", {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, country, age, gender, region})
            })
            if (!res.ok) {
                const err = await res.json()
                setError(err.message || t('common.errors.err_update_profile'))
                return
            }
            setSuccess(t('common.success.succ_update_profile'))
        } catch (err) {
            setError(t('common.errors.err_update_profile'))
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

    const handleSendTOTPMail = async () => {
        try {
            setIsLoading(true)
            const res = await authFetch("/user/send/totp-instructions", {
                method: "POST",
            })

            const data = await res.json()

            if (!res.ok) {
                const err = data.message;
                setIsLoading(false)
                setOpenModalBox(undefined)
                setError(err)
                return
            }

        } catch (err) {
            console.error("Error details:", err);
            setError(err.message || String(err) || t('common.errors.err_occurred'));
            setIsLoading(false);
            setOpenModalBox(undefined);
        }
    }

    const handleYesClick = async () => {
        try {
            setIsLoading(true)
            const res = await authFetch("/user/disable-totp", {
                method: "POST",
            })

            const data = await res.json()

            if (res.status !== 200) {
                const err = data.message;
                setIsLoading(false)
                setOpenModalBox(undefined)
                setError(err)
                return
            }

        } catch (err) {
            console.error("Error details:", err);
            setError(err.message || String(err) || t('common.errors.err_occurred'));
            setIsLoading(false);
            setOpenModalBox(undefined);
        }
    }

    const openModalMessageBox = (title: string, bodyText: string, footerText: string,
                                 messageType: "info" | "warning" | "error",
                                 buttonType: "ok" | "yesno" | "next") => {
        setOpenModalBox({
            title,
            bodyText,
            footerText,
            messageType,
            buttonType,
            onNextClick: handleSendTOTPMail,
            onYesClick: handleYesClick,
    })
    }

    return (
        <ProtectedRoute>
            <div className="max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-center">{t('common.pg_profile.your_profile')}</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}

                {/* Profile Picture Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                        <img src={profilePic} alt="Profile Picture" className="w-full h-full object-cover"/>
                    </div>
                    <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleProfilePicChange}
                        className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-900 file:rounded-xl file:text-sm file:font-semibold file:bg-blue-600 file:hover:bg-blue-700 file:hover:cursor-pointer"
                    />
                    <p className={"text-gray-500 text-xs"}>Max file size: 5MB</p>
                </div>

                {/* Personal Information Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">{t('common.pg_profile.personal_info')}</h2>
                    <div className="mb-4">
                        <label className="block text-lg font-semibold mb-1">{t('common.pg_profile.username')}</label>
                        <input
                            type="text"
                            value={profile?.username || ""}
                            readOnly
                            className="border p-2 w-full rounded-xl shadow-sm bg-gray-600 cursor-not-allowed"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-lg font-semibold mb-1">{t('common.pg_profile.email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                validateEmail(e.target.value);
                            }}
                            className="border p-2 w-full rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                        />
                        {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-lg font-semibold mb-1">{t('common.pg_profile.country')}</label>
                        {countries.length > 0 ? (
                            <select
                                value={country}
                                onChange={handleCountryChange}
                                className="border p-2 w-full rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                <option value="">Select a country</option>
                                {countries.map((c) => (
                                    <option key={c.iso3} value={c.name}>
                                        {locale === 'de' ? c.translations.de : c.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-gray-500">Loading countries...</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-lg font-semibold mb-1">{t('common.pg_profile.age')}</label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(Number(e.target.value))}
                            className="border p-2 w-full rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-semibold mb-1">{t('common.pg_profile.gender')}</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="border p-2 w-full rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <option value={"m"}>{t('common.pg_profile.male')}</option>
                            <option value={"f"}>{t('common.pg_profile.female')}</option>
                            <option value={"d"}>{t('common.pg_profile.diverse')}</option>
                        </select>
                    </div>
                </div>

                {/* Account Settings Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">{t('common.pg_profile.account_settings')}</h2>
                    <div className="mb-4">
                        <label className="block text-lg font-semibold mb-1">{t('common.pg_profile.region')}</label>
                        <input
                            type="text"
                            value={region}
                            readOnly
                            className="border p-2 w-full rounded-xl shadow-sm bg-gray-600 cursor-not-allowed"
                        />
                    </div>
                    <div className="mb-4">
                        {!totpActivated ? (
                            <button
                                type={"button"}
                                value={"2FA"}
                                onClick={() => openModalMessageBox("Enable 2FA", "continue to get the mail with instructions", "", "info", "next")}
                                className={"w-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md mt-10"}
                            >{t('common.pg_profile.enable_2fa')}
                            </button>
                        ): (
                            <button
                                type={"button"}
                                value={"2FA"}
                                onClick={() => openModalMessageBox("Disable 2FA", "do you want to disable TOTP Verification?", "", "info", "yesno")}
                                className={"w-full flex items-center justify-center bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md mt-10"}
                            >{t('common.pg_profile.disable_2fa')}
                            </button>
                        )}
                    </div>
                    <div className="mb-4">
                        <Link
                            href={"/password-reset-request"}
                            className="w-full flex items-center justify-center bg-amber-500 hover:bg-amber-700 text-black font-bold py-3 px-4 rounded-xl transition-colors shadow-md"
                        >
                            {t('common.pg_profile.reset_password')}
                        </Link>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    onClick={handleSubmit}
                    className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md mt-10"
                >
                    {isLoading ? t('common.pg_profile.updating_profile') : t('common.pg_profile.update_profile')}
                </button>
            </div>
            {openModalBox && (
                <ModalBox
                    title={openModalBox.title}
                    messageType={openModalBox.messageType}
                    footerText={openModalBox.footerText}
                    bodyText={openModalBox.bodyText}
                    onClose={() => setOpenModalBox(undefined)}
                    buttonType={openModalBox.buttonType}
                    onNextClick={openModalBox.onNextClick}
                    onNoClick={() => setOpenModalBox(undefined)}
                    onYesClick={openModalBox.onYesClick}
                />
            )}
        </ProtectedRoute>
    )
}

export default ProfilePage
