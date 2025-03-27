// lib/LanguageContext.tsx
"use client";

import React, {createContext, useContext, useState, useEffect, ReactNode, useMemo} from 'react';

// Define your translations
export const translations = {
        en: {
            common: {
                welcome: "Welcome to",
                subtitle: "Your Voice in the Anime Community",
                login: "Login",
                signup: "Sign Up",
                signup_prelaunch: "Sign Up for Pre-launch",
                discover: "Discover Polls",
                dashboard: "Dashboard",
                profile: "Profile",
                logout: "Logout",
                getStarted: "Get Started",
                back: "Back",
                loading: "Loading...",
                creating: "Creating...",
                updating: "Updating...",
                save: "Save",
                cancel: "Cancel",
                delete: "Delete",
                edit: "Edit",
                submit: "Submit",
                continue: "Continue",
                next: "Next",
                previous: "Previous",
                close: "Close",
                confirm: "Confirm",
                question: "Question",
                of: 'of',
                yes: "Yes",
                no: "No",
                features: {
                    polls: "Create & Participate in Polls",
                    pollsDesc: "Engage with the community through interactive polls about your favorite anime series, characters, and more.",
                    community: "Join the Discussion",
                    communityDesc: "Share your opinions, discover new perspectives, and connect with fellow anime enthusiasts.",
                    personalization: "Personalized Experience",
                    personalizationDesc: "Get recommendations and discover new anime based on your poll participation and preferences."
                },
                errors: {
                    err_get_profile: "Failed to load profile",
                    err_update_profile: "Failed to update profile",
                    err_countries: "Failed to load countries",
                    err_invalid_email: "Please enter a valid email address",
                    err_occurred: "An error occurred",
                    err_details: "Error details:",
                    err_login_failed: "Login failed",
                    err_signup_failed: "Signup failed",
                    err_password_match: "Passwords do not match",
                    err_password_requirements: "Password does not meet requirements",
                    err_empty_fields: "Please fill in all required fields",
                    err_invalid_totp: "Invalid verification code",
                    err_survey_load: "Failed to load survey details",
                    err_survey_create: "Failed to create survey",
                    err_survey_update: "Failed to update survey",
                    err_question_create: "Failed to create question",
                    err_questions_load: "Failed to load questions",
                    err_results_load: "Failed to load results",
                    err_delete_survey: "Failed to delete survey",
                    err_file_size: "File is too big! Max size is 5MB!",
                    err_get_genres: "Failed to load genres",
                    err_parsing_config: "Error parsing rating configuration",
                    err_question_update: "Failed to update question",
                    err_surveys_load: "Failed to load public surveys",
                    err_responses_submit: "Failed to submit responses",
                },
                success: {
                    succ_update_profile: "Profile updated successfully",
                    succ_login: "Login successful",
                    succ_signup: "Registration successful! You can now log in.",
                    succ_password_reset: "Password reset email has been sent",
                    succ_password_changed: "Password has been changed successfully",
                    succ_survey_created: "Survey created successfully",
                    succ_survey_updated: "Survey updated successfully",
                    succ_question_created: "Question created successfully",
                    succ_question_updated: "Question updated successfully",
                    succ_question_deleted: "Question deleted successfully",
                    succ_responses_submitted: "Responses submitted successfully",
                    succ_totp_enabled: "Two-factor authentication enabled",
                    succ_totp_disabled: "Two-factor authentication disabled",
                    succ_verification: "Verification successful"
                },
                survey: {
                    create_survey: "Create New Survey",
                    edit_survey: "Edit Survey",
                    title: "Title",
                    description: "Description",
                    visibility: "Visibility",
                    genre: "Genre",
                    public: "Public",
                    private: "Private",
                    create_question: "Create New Question",
                    edit_question: "Edit Question",
                    question_text: "Question Text",
                    question_type: "Question Type",
                    multiple_choice: "Multiple Choice",
                    text: "Text",
                    rating: "Rating",
                    answer_type: 'Answer Type',
                    possible_answers: "Possible Answers",
                    rating_range: "Rating Range",
                    display_type: "Display Type",
                    min_label: "Minimum Label",
                    max_label: "Maximum Label",
                    allow_half_steps: "Allow Half Steps",
                    star_rating: "Star Rating",
                    slider: "Slider",
                    radio_buttons: "Radio Buttons",
                    add_option: "Add Option",
                    remove_option: "Remove Option",
                    max_options_reached: "Maximum of {0} options reached.",
                    questions: "Questions",
                    results: "Results",
                    answer_survey: "Answer Survey",
                    view_results: "View Results",
                    question_count: "{0} Questions",
                    average_rating: "Average Rating: {0} / {1}",
                    no_options: "No options data.",
                    no_distribution: "No distribution data.",
                    no_results: "No aggregated results yet...",
                    no_questions: "No questions found.",
                    show_responses: 'Show Responses',
                    search_surveys: 'Search surveys',
                    hide_responses: 'Hide Responses',
                    sort_responses: 'Sort Responses',
                    newest_first: 'Newest first',
                    oldest_first: 'Oldest first',
                    no_responses: 'No responses yet.',
                    cant_set_public: 'You can set your survey public once it has at least one question',
                    update_survey: "Update Survey",
                    select_genre: "Select a Genre",
                    rating_config: "Rating Configuration",
                    create_first_question: "Create your first question using the form above.",
                    text_response_description: "This question allows free-form text responses from participants.",
                    option_placeholder: "Option {0}",
                    remove_option_aria: "Remove option {0}",
                    comma_separated_options: "Possible Answers (comma separated)",
                    no_options_error: "Please provide at least one option for multiple-choice questions.",
                    rating_labels_required: "Please provide texts for the minimum and maximum rating values.",
                    select_answer: "Select an Answer",
                    your_answer: "Your Answer",
                    type_answer_here: "Type your answer here...",
                    submit_responses: "Submit Responses",
                    question_pagination: "Question {0} of {1}",
                    validation_min_one_question: "Please answer at least one question before submitting",
                    validation_text_required: "Please provide an answer for this question",
                    at_least_one_required: "At least one question must be answered",
                    submitting: "Submitting...",
                },
                msg_confirm: {
                    delete_survey: "Are you sure you want to delete this survey? This action cannot be undone.",
                    delete_question: "Are you sure you want to delete this question? This action cannot be undone."
                },
                timeframe: {
                    survey_timeframe: "Survey Timeframe",
                    enabled: "Enabled",
                    disabled: "Disabled",
                    start_date: "Start Date & Time",
                    end_date: "End Date & Time",
                    select_start: "Select start date and time",
                    select_end: "Select end date and time",
                    select_first: "Please select a start date first",
                    date_range_error: "End date must be after start date",
                    active_period: "Survey will be active from {0} to {1}",
                    timeframe_description: "Set a specific time period when this survey will be available for responses.",
                    both_dates_required: "Please set both start and end dates to enable timeframe"
                },
                maintenance: {
                    mode: "The website is currently under maintenance. Some features are temporarily unavailable."
                },
                auth: {
                    login_title: "Login",
                    signup_title: "Sign Up",
                    email: "Email",
                    username: "Username",
                    password: "Password",
                    confirm_password: "Confirm Password",
                    beta_key: "Beta Key",
                    forgot_password: "Forgot your password?",
                    have_account: "Already have an account?",
                    no_account: "Don't have an account?",
                    reset_password: "Reset Password",
                    check_email: "Check Your Email",
                    reset_link_sent: "We've sent a password reset link to {0}. Please check your inbox and follow the instructions.",
                    try_another_email: "Try another email",
                    password_criteria: {
                        length: "Password contains at least 8 characters",
                        chars: "Password contains letters (A-Z, a-z) and allowed characters (!?,.#&$'\"@;*#_)",
                        space: "Password does not contain spaces",
                        digits: "Password contains at least one digit (0-9)"
                    },
                    privacy_policy: "By submitting this form, I agree to the privacy policy",
                    verification: {
                        title: "Two-Factor Authentication",
                        code_prompt: "Please enter the 6-digit code from your authenticator app",
                        code_label: "Authentication Code",
                        verifying: "Verifying...",
                        verify: "Verify",
                        success: "Verification Successful",
                        success_message: "Your account has been verified successfully. Redirecting..."
                    }
                },
                pg_profile: {
                    username: "Username",
                    email: "Email",
                    country: "Country",
                    select_country: "Select a country",
                    age: "Age",
                    gender: "Gender",
                    personal_info: "Personal Information",
                    account_settings: "Account Settings",
                    region: "Region",
                    enable_2fa: "Enable 2-Factor Authentication",
                    disable_2fa: "Disable 2-Factor Authentication",
                    reset_password: "Reset Your Password",
                    update_profile: "Update Profile",
                    updating_profile: 'Updating...',
                    your_profile: "Your Profile",
                    profile_picture: "Profile Picture",
                    max_file_size: "Max file size: 5MB",
                    male: "Male",
                    female: "Female",
                    diverse: "Diverse",
                    "2fa_dialog": {
                        enable_title: "Enable 2FA",
                        enable_body: "Continue to get the mail with instructions",
                        disable_title: "Disable 2FA",
                        disable_body: "Do you want to disable TOTP verification?"
                    }
                },
                password_reset: {
                    title: "Reset Your Password",
                    email_prompt: "Enter your email address below and we'll send you a link to reset your password.",
                    processing: "Processing...",
                    check_email_title: "Check Your Email",
                    check_email_body: "We've sent a password reset link to {0}. Please check your inbox and follow the instructions.",
                    try_another: "Try another email",
                    change_password: "Reset Your Password",
                    changing: "Changing Password...",
                    success_title: "Done!",
                    success_message: "Your Password was successfully changed!",
                    back_to_login: "Go Login again."
                },
                pg_discover: {
                    title: "Discover Polls",
                    search: "Search surveys...",
                    filter_by_genre: "Filter by Genre",
                    select_genres: "Select Genres",
                    sort_by_date: "Sort by Date:",
                    newest: "Newest First",
                    oldest: "Oldest First",
                    clear_filters: "Clear Filters",
                    last_updated: "Last updated: {0}",
                    view_survey: "View Survey",
                    no_surveys: "No surveys found."
                },
                prelaunch: {
                    title: "AnimePoll",
                    subtitle: "Your Voice in the Anime Community",
                    feature_community: "Community Driven",
                    feature_community_desc: "Shape the future of anime with your voice",
                    feature_tastemap: "Anime Taste-Map",
                    feature_tastemap_desc: "Find out something new about your taste in anime",
                    feature_insights: "Real-time Insights",
                    feature_insights_desc: "Watch community trends evolve live",
                    early_access: "Get Early Access",
                    launching_msg: "We're launching soon! Sign up to be notified when we go live.",
                    thank_you: "Thank you for your interest! We'll be in touch soon.",
                    notify_me: "Notify Me",
                    email_placeholder: "Enter your email address",
                    privacy_note: "We respect your privacy and will never share your email with third parties."
                },
                legal: {
                    legal: "Legal",
                    imprint: "Imprint",
                    contact: "Contact Me",
                    contact_title: "Contact Me",
                    name: "Name",
                    email: "Email",
                    message: "Your Message:",
                    send_message: "Send Message"
                }
            }
        },
        de: {
            common: {
                welcome: "Willkommen bei",
                subtitle: "Deine Stimme in der Anime-Community",
                login: "Anmelden",
                signup: "Registrieren",
                signup_prelaunch: "Registrieren für den Pre-Launch",
                discover: "Umfragen entdecken",
                dashboard: "Dashboard",
                profile: "Profil",
                logout: "Abmelden",
                getStarted: "Loslegen",
                back: "Zurück",
                loading: "Wird geladen...",
                creating: "Wird erstellt...",
                updating: "Wird aktualisiert...",
                save: "Speichern",
                cancel: "Abbrechen",
                delete: "Löschen",
                edit: "Bearbeiten",
                submit: "Absenden",
                continue: "Fortfahren",
                next: "Weiter",
                previous: "Zurück",
                close: "Schließen",
                confirm: "Bestätigen",
                question: 'Frage',
                of:'von',
                yes: "Ja",
                no: "Nein",
                features: {
                    polls: "Erstelle & nimm an Umfragen teil",
                    pollsDesc: "Engagiere dich in der Community durch interaktive Umfragen über deine Lieblingsanimeserien, Charaktere und mehr.",
                    community: "Nimm an Diskussionen teil",
                    communityDesc: "Teile deine Meinungen, entdecke neue Perspektiven und vernetze dich mit anderen Anime-Enthusiasten.",
                    personalization: "Personalisierte Erfahrung",
                    personalizationDesc: "Erhalte Empfehlungen und entdecke neue Anime basierend auf deiner Umfragenteilnahme und deinen Präferenzen."
                },
                errors: {
                    err_get_profile: "Fehler beim Laden des Profils",
                    err_update_profile: "Fehler beim Aktualisieren des Profils",
                    err_countries: "Fehler beim Laden der Länder",
                    err_invalid_email: "Bitte gib eine gültige E-Mail-Adresse ein",
                    err_occurred: "Ein Fehler ist aufgetreten",
                    err_details: "Fehlerdetails:",
                    err_login_failed: "Anmeldung fehlgeschlagen",
                    err_signup_failed: "Registrierung fehlgeschlagen",
                    err_password_match: "Passwörter stimmen nicht überein",
                    err_password_requirements: "Passwort erfüllt nicht die Anforderungen",
                    err_empty_fields: "Bitte fülle alle erforderlichen Felder aus",
                    err_invalid_totp: "Ungültiger Verifizierungscode",
                    err_survey_load: "Fehler beim Laden der Umfragedetails",
                    err_survey_create: "Fehler beim Erstellen der Umfrage",
                    err_survey_update: "Fehler beim Aktualisieren der Umfrage",
                    err_question_create: "Fehler beim Erstellen der Frage",
                    err_questions_load: "Fehler beim Laden der Fragen",
                    err_results_load: "Fehler beim Laden der Ergebnisse",
                    err_delete_survey: "Fehler beim Löschen der Umfrage",
                    err_file_size: "Datei ist zu groß! Maximale Größe ist 5MB!",
                    err_deletion: "Deletion Failed",
                    err_get_genres: "Fehler beim Laden der Genres",
                    err_parsing_config: "Fehler beim Parsen der Bewertungskonfiguration",
                    err_question_update: "Fehler beim Aktualisieren der Frage",
                    err_surveys_load: "Fehler beim Laden der öffentlichen Umfragen",
                    err_responses_submit: "Fehler beim Senden der Antworten",
                },
                success: {
                    succ_update_profile: "Profil erfolgreich aktualisiert",
                    succ_login: "Anmeldung erfolgreich",
                    succ_signup: "Registrierung erfolgreich! Du kannst dich jetzt anmelden.",
                    succ_password_reset: "E-Mail zum Zurücksetzen des Passworts wurde gesendet",
                    succ_password_changed: "Passwort wurde erfolgreich geändert",
                    succ_survey_created: "Umfrage erfolgreich erstellt",
                    succ_survey_updated: "Umfrage erfolgreich aktualisiert",
                    succ_question_created: "Frage erfolgreich erstellt",
                    succ_question_updated: "Frage erfolgreich aktualisiert",
                    succ_question_deleted: "Frage erfolgreich gelöscht",
                    succ_responses_submitted: "Antworten erfolgreich abgesendet",
                    succ_totp_enabled: "Zwei-Faktor-Authentifizierung aktiviert",
                    succ_totp_disabled: "Zwei-Faktor-Authentifizierung deaktiviert",
                    succ_verification: "Verifizierung erfolgreich"
                },
                survey: {
                    create_survey: "Neue Umfrage erstellen",
                    edit_survey: "Umfrage bearbeiten",
                    title: "Titel",
                    description: "Beschreibung",
                    visibility: "Sichtbarkeit",
                    genre: "Genre",
                    public: "Öffentlich",
                    private: "Privat",
                    answer_type: 'Antwort Art',
                    create_question: "Neue Frage erstellen",
                    edit_question: "Frage bearbeiten",
                    question_text: "Fragetext",
                    question_type: "Fragetyp",
                    multiple_choice: "Multiple Choice",
                    text: "Text",
                    rating: "Bewertung",
                    possible_answers: "Mögliche Antworten",
                    rating_range: "Bewertungsbereich",
                    display_type: "Anzeigetyp",
                    delete_survey: "Umfrage löschen",
                    min_label: "Minimum-Bezeichnung",
                    max_label: "Maximum-Bezeichnung",
                    allow_half_steps: "Halbe Schritte erlauben",
                    star_rating: "Sternebewertung",
                    slider: "Schieberegler",
                    radio_buttons: "Optionsfelder",
                    add_option: "Option hinzufügen",
                    remove_option: "Option entfernen",
                    max_options_reached: "Maximale Anzahl von {0} Optionen erreicht.",
                    questions: "Fragen",
                    results: "Ergebnisse",
                    answer_survey: "Umfrage beantworten",
                    answer_count: 'Anzahl der Antworten',
                    view_results: "Ergebnisse ansehen",
                    question_count: "{0} Fragen",
                    average_rating: "Durchschnittliche Bewertung: {0} / {1}",
                    no_options: "Keine Optionsdaten.",
                    no_distribution: "Keine Verteilungsdaten.",
                    no_results: "Noch keine aggregierten Ergebnisse...",
                    no_questions: "Keine Fragen gefunden.",
                    search_surveys: "Umfragen suchen...",
                    show_responses: 'Zeige Antworten',
                    hide_responses: 'Verstecke Antworten',
                    sort_responses: 'Sortiere Antworten',
                    newest_first: 'Neuste erst',
                    oldest_first: 'Älteste erst',
                    no_responses: 'Bisher keine Antworten.',
                    cant_set_public: 'Du kannst die Umfrage erst öffentlich machen, sobald sie mindestens eine Frage enthält',
                    update_survey: "Umfrage aktualisieren",
                    select_genre: "Wähle ein Genre",
                    rating_config: "Bewertungskonfiguration",
                    create_first_question: "Erstelle deine erste Frage mit dem Formular oben.",
                    text_response_description: "Diese Frage ermöglicht Freitextantworten von Teilnehmern.",
                    option_placeholder: "Option {0}",
                    remove_option_aria: "Option {0} entfernen",
                    comma_separated_options: "Mögliche Antworten (durch Komma getrennt)",
                    no_options_error: "Bitte gib mindestens eine Option für Multiple-Choice-Fragen an.",
                    rating_labels_required: "Bitte gib Texte für die Minimal- und Maximalwerte der Bewertung an.",
                    select_answer: "Wähle eine Antwort",
                    your_answer: "Deine Antwort",
                    type_answer_here: "Gib deine Antwort hier ein...",
                    submit_responses: "Antworten absenden",
                    question_pagination: "Frage {0} von {1}",
                    validation_min_one_question: "Bitte beantworte mindestens eine Frage vor dem Absenden",
                    validation_text_required: "Bitte gib eine Antwort für diese Frage ein",
                    at_least_one_required: "Mindestens eine Frage muss beantwortet werden",
                    submitting: "Wird gesendet...",
                },
                msg_confirm: {
                    delete_survey: "Bist du sicher, dass du diese Umfrage löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.",
                    delete_question: "Bist du sicher, dass du diese Frage löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden."
                },
                timeframe: {
                    survey_timeframe: "Umfragezeitraum",
                    enabled: "Aktiviert",
                    disabled: "Deaktiviert",
                    start_date: "Startdatum & -zeit",
                    end_date: "Enddatum & -zeit",
                    select_start: "Startdatum und -zeit auswählen",
                    select_end: "Enddatum und -zeit auswählen",
                    select_first: "Bitte wähle zuerst ein Startdatum",
                    date_range_error: "Enddatum muss nach dem Startdatum liegen",
                    active_period: "Umfrage wird aktiv sein von {0} bis {1}",
                    timeframe_description: "Lege einen bestimmten Zeitraum fest, in dem diese Umfrage für Antworten verfügbar sein wird.",
                    both_dates_required: "Bitte setze sowohl Start- als auch Enddatum, um den Zeitraum zu aktivieren"
                },
                maintenance: {
                    mode: "Die Website wird derzeit gewartet. Einige Funktionen sind vorübergehend nicht verfügbar."
                },
                auth: {
                    login_title: "Anmelden",
                    signup_title: "Registrieren",
                    email: "E-Mail",
                    username: "Benutzername",
                    password: "Passwort",
                    confirm_password: "Passwort bestätigen",
                    beta_key: "Beta-Schlüssel",
                    forgot_password: "Passwort vergessen?",
                    have_account: "Hast du bereits ein Konto?",
                    no_account: "Hast du noch kein Konto?",
                    reset_password: "Passwort zurücksetzen",
                    check_email: "Überprüfe deine E-Mail",
                    reset_link_sent: "Wir haben einen Link zum Zurücksetzen deines Passworts an {0} gesendet. Bitte überprüfe deinen Posteingang und folge den Anweisungen.",
                    try_another_email: "Andere E-Mail-Adresse versuchen",
                    password_criteria: {
                        length: "Passwort enthält mindestens 8 Zeichen",
                        chars: "Passwort enthält Buchstaben (A-Z, a-z) und erlaubte Sonderzeichen (!?,.#&$'\"@;*#_)",
                        space: "Passwort enthält keine Leerzeichen",
                        digits: "Passwort enthält mindestens eine Ziffer (0-9)"
                    },
                    privacy_policy: "Mit dem Absenden dieses Formulars stimme ich der Datenschutzerklärung zu",
                    verification: {
                        title: "Zwei-Faktor-Authentifizierung",
                        code_prompt: "Bitte gib den 6-stelligen Code aus deiner Authentifizierungs-App ein",
                        code_label: "Authentifizierungscode",
                        verifying: "Wird verifiziert...",
                        verify: "Verifizieren",
                        success: "Verifizierung erfolgreich",
                        success_message: "Dein Konto wurde erfolgreich verifiziert. Weiterleitung..."
                    }
                },
                pg_profile: {
                    username: "Benutzername",
                    email: "E-Mail",
                    country: "Land",
                    select_country: "Land auswählen",
                    age: "Alter",
                    gender: "Geschlecht",
                    personal_info: "Persönliche Informationen",
                    account_settings: "Kontoeinstellungen",
                    region: "Region",
                    enable_2fa: "Zwei-Faktor-Authentifizierung aktivieren",
                    disable_2fa: "Zwei-Faktor-Authentifizierung deaktivieren",
                    reset_password: "Passwort zurücksetzen",
                    update_profile: "Profil aktualisieren",
                    updating_profile: 'Aktualisiere...',
                    your_profile: "Dein Profil",
                    profile_picture: "Profilbild",
                    max_file_size: "Maximale Dateigröße: 5MB",
                    male: "Männlich",
                    female: "Weiblich",
                    diverse: "Divers",
                    "2fa_dialog":
                        {
                            enable_title: "2FA aktivieren",
                            enable_body: "Fortfahren, um die E-Mail mit Anweisungen zu erhalten",
                            disable_title: "2FA deaktivieren",
                            disable_body: "Möchtest du die TOTP-Verifizierung deaktivieren?"
                        }
                },
                password_reset: {
                    title: "Passwort zurücksetzen",
                    email_prompt: "Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen deines Passworts.",
                    processing: "Wird verarbeitet...",
                    check_email_title: "Überprüfe deine E-Mail",
                    check_email_body: "Wir haben einen Link zum Zurücksetzen deines Passworts an {0} gesendet. Bitte überprüfe deinen Posteingang und folge den Anweisungen.",
                    try_another: "Andere E-Mail versuchen",
                    change_password: "Passwort zurücksetzen",
                    changing: "Passwort wird geändert...",
                    success_title: "Erledigt!",
                    success_message: "Dein Passwort wurde erfolgreich geändert!",
                    back_to_login: "Zur Anmeldung zurückkehren."
                },
                pg_discover: {
                    title: "Umfragen entdecken",
                    search: "Umfragen durchsuchen...",
                    filter_by_genre: "Nach Genre filtern",
                    select_genres: "Genres auswählen",
                    sort_by_date: "Nach Datum sortieren:",
                    newest: "Neueste zuerst",
                    oldest: "Älteste zuerst",
                    clear_filters: "Filter zurücksetzen",
                    last_updated: "Letzte Aktualisierung: {0}",
                    view_survey: "Umfrage ansehen",
                    no_surveys: "Keine Umfragen gefunden."
                },
                prelaunch: {
                    title: "AnimePoll",
                    subtitle: "Deine Stimme in der Anime-Community",
                    feature_community: "Community-getrieben",
                    feature_community_desc: "Gestalte die Zukunft von Anime mit deiner Stimme",
                    feature_tastemap: "Anime Geschmackskarte",
                    feature_tastemap_desc: "Entdecke Neues über deinen Anime-Geschmack",
                    feature_insights: "Echtzeit-Einblicke",
                    feature_insights_desc: "Beobachte, wie sich Community-Trends live entwickeln",
                    early_access: "Frühzeitigen Zugang erhalten",
                    launching_msg: "Wir starten bald! Melde dich an, um benachrichtigt zu werden, wenn wir live gehen.",
                    thank_you: "Vielen Dank für dein Interesse! Wir melden uns bald bei dir.",
                    notify_me: "Benachrichtige mich",
                    email_placeholder: "E-Mail-Adresse eingeben",
                    privacy_note: "Wir respektieren deine Privatsphäre und werden deine E-Mail niemals an Dritte weitergeben."
                },
                legal: {
                    legal: "Rechtliches",
                    imprint: "Impressum",
                    contact: "Kontakt",
                    contact_title: "Kontaktiere mich",
                    name: "Name",
                    email: "E-Mail",
                    message: "Deine Nachricht:",
                    send_message: "Nachricht senden"
                }
            }
        }
    }
;

export type Locale = keyof typeof translations;

type LanguageContextType = {
    locale: Locale;
    t: (path: string) => string;
    changeLocale: (newLocale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    // Default to 'en' initially - will be updated after checking localStorage
    const [locale, setLocale] = useState<Locale>('en');

    useEffect(() => {
        // Only run in the browser
        if (typeof window !== 'undefined') {
            const savedLocale = localStorage.getItem('language') as Locale;
            if (savedLocale && ['en', 'de'].includes(savedLocale)) {
                setLocale(savedLocale);
            } else {
                // Get browser language
                const browserLang = navigator.language.split('-')[0];
                const newLocale = ['en', 'de'].includes(browserLang) ? browserLang as Locale : 'en';
                setLocale(newLocale);
                localStorage.setItem('language', newLocale);
            }
        }
    }, []);

    // Create a memoized translation function
    const t = useMemo(() => {
        return (path: string) => {
            const keys = path.split('.');
            const namespace = keys[0];

            // Handle missing namespace
            if (!translations[locale][namespace]) {
                return path;
            }

            let value: any = translations[locale][namespace];

            // Navigate through the nested objects
            for (let i = 1; i < keys.length; i++) {
                if (!value[keys[i]]) {
                    return path;
                }
                value = value[keys[i]];
            }

            return value;
        };
    }, [locale]);

    // Language change function
    const changeLocale = (newLocale: Locale) => {
        if (['en', 'de'].includes(newLocale) && newLocale !== locale) {
            localStorage.setItem('language', newLocale);
            setLocale(newLocale);
        }
    };

    // Create a memoized context value
    const contextValue = useMemo(() => {
        return {locale, t, changeLocale};
    }, [locale, t]);

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};