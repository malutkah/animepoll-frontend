"use client"

import React, {useState, useEffect, useRef} from "react";
import {
    format,
    addHours,
    addMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isBefore,
    isAfter,
    isSameDay,
    addDays,
    setHours,
    setMinutes,
    parseISO,
    addMinutes
} from "date-fns";
import {Calendar, ChevronLeft, ChevronRight, Clock} from "lucide-react";

interface DateTimePickerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
    minDate?: Date;
    placeholder?: string;
    disabled?: boolean;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
                                                           value,
                                                           onChange,
                                                           minDate = addHours(new Date(), 1),
                                                           placeholder = "Select date and time",
                                                           disabled = false
                                                       }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(value || minDate);
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(value || minDate));
    const [selectedHour, setSelectedHour] = useState(value ? value.getHours() : minDate.getHours());
    const [selectedMinute, setSelectedMinute] = useState(value ? value.getMinutes() : 0);
    const [view, setView] = useState<"date" | "time">("date");
    const pickerRef = useRef<HTMLDivElement>(null);

    // Calculate UTC+1 offset in minutes
    const getUtcPlusOneOffset = () => {
        // UTC+1 is 60 minutes ahead of UTC
        const utcPlusOneOffsetMinutes = 60;
        // Get local timezone offset in minutes
        const localOffsetMinutes = new Date().getTimezoneOffset();
        // The difference is what we need to adjust
        return utcPlusOneOffsetMinutes + localOffsetMinutes;
    };

    // Convert a date to UTC+1
    const toUtcPlusOne = (date: Date): Date => {
        return addMinutes(date, getUtcPlusOneOffset());
    };

    // Convert from UTC+1 to local time
    const fromUtcPlusOne = (date: Date): Date => {
        return addMinutes(date, -getUtcPlusOneOffset());
    };

    // Format a date in UTC+1 for display
    const formatInUtcPlusOne = (date: Date, formatStr: string): string => {
        const utcPlusOneDate = toUtcPlusOne(date);
        return format(utcPlusOneDate, formatStr);
    };

    useEffect(() => {
        if (value) {
            // Convert the incoming value to UTC+1 for internal state
            const utcPlusOneValue = value; // Assuming value is already in UTC+1
            setCurrentDate(utcPlusOneValue);
            setCurrentMonth(startOfMonth(utcPlusOneValue));
            setSelectedHour(utcPlusOneValue.getHours());
            setSelectedMinute(utcPlusOneValue.getMinutes());
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const togglePicker = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handlePrevMonth = () => {
        setCurrentMonth(addMonths(currentMonth, -1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const handleDateSelect = (date: Date) => {
        // Create a new date in UTC+1
        const newDate = new Date(date);
        newDate.setHours(selectedHour);
        newDate.setMinutes(selectedMinute);
        setCurrentDate(newDate);

        if (isBefore(newDate, minDate)) {
            const adjustedDate = new Date(minDate);
            adjustedDate.setHours(minDate.getHours());
            adjustedDate.setMinutes(minDate.getMinutes());
            setCurrentDate(adjustedDate);
            setSelectedHour(adjustedDate.getHours());
            setSelectedMinute(adjustedDate.getMinutes());
            onChange(adjustedDate);
            setView("time");
        } else {
            onChange(newDate);
            setView("time");
        }
    };

    const handleTimeChange = () => {
        // Create a new date in UTC+1
        const newDate = new Date(currentDate);
        newDate.setHours(selectedHour);
        newDate.setMinutes(selectedMinute);

        if (isBefore(newDate, minDate)) {
            const adjustedDate = new Date(minDate);
            onChange(adjustedDate);
            setSelectedHour(adjustedDate.getHours());
            setSelectedMinute(adjustedDate.getMinutes());
        } else {
            onChange(newDate);
        }

        setIsOpen(false);
    };

    const handleClear = () => {
        onChange(null);
        setIsOpen(false);
    };

    const renderCalendar = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        // Days of week header
        const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const isToday = isSameDay(day, new Date());
                const isSelected = value && isSameDay(day, value);
                const isDisabled = isBefore(day, minDate) && !isSameDay(day, minDate);
                const isCurrentMonth = isSameDay(day, monthStart) || isAfter(day, monthStart) && isBefore(day, monthEnd) || isSameDay(day, monthEnd);

                days.push(
                    <div
                        key={day.toString()}
                        className={`py-2 text-center rounded-xl transition-colors cursor-pointer
                                  ${isDisabled ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" : "hover:bg-indigo-100 dark:hover:bg-indigo-900"}
                                  ${isSelected ? "bg-indigo-500 text-white hover:bg-indigo-600" : ""}
                                  ${isToday && !isSelected ? "bg-gray-100 dark:bg-gray-700" : ""}
                                  ${!isCurrentMonth ? "text-gray-400 dark:text-gray-500" : ""}`
                        }
                        onClick={() => !isDisabled && handleDateSelect(cloneDay)}
                    >
                        {formattedDate}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7 gap-1">
                    {days}
                </div>
            );
            days = [];
        }

        return (
            <div className="p-4">
                <div className="flex justify-between rounded-xl items-center mb-4">
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <ChevronLeft className="h-5 w-5"/>
                    </button>
                    <div className="font-semibold">
                        {format(currentMonth, "MMMM yyyy")}
                    </div>
                    <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <ChevronRight className="h-5 w-5"/>
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {daysOfWeek.map((day) => (
                        <div key={day} className="text-center font-medium text-sm text-gray-500 dark:text-gray-400">
                            {day}
                        </div>
                    ))}
                </div>

                {rows}
            </div>
        );
    };

    const renderTimePicker = () => {
        // Create arrays of hours and minutes
        const hours = Array.from({length: 24}, (_, i) => i);
        const minutes = Array.from({length: 12}, (_, i) => i * 5);

        const isTimeDisabled = (hour: number, minute: number) => {
            if (!isSameDay(currentDate, minDate)) return false;
            const testDate = new Date(currentDate);
            testDate.setHours(hour);
            testDate.setMinutes(minute);
            return isBefore(testDate, minDate);
        };

        return (
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <button
                        type="button"
                        onClick={() => setView("date")}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 flex items-center"
                    >
                        <ChevronLeft className="h-5 w-5 mr-1"/>
                        Back to calendar
                    </button>
                    <div className="font-semibold">
                        {format(currentDate, "dd.MM.yyyy")}
                    </div>
                </div>

                <div className="flex justify-center rounded-xl space-x-4 mb-4">
                    <div className="w-1/2 rounded-xl">
                        <div className="text-center mb-2 text-gray-600 dark:text-gray-300">Hours (UTC+1)</div>
                        <div className="h-48 overflow-y-auto border rounded-md border-gray-200 dark:border-gray-700">
                            {hours.map((hour) => (
                                <div
                                    key={hour}
                                    className={`py-2 text-center cursor-pointer ${
                                        selectedHour === hour
                                            ? "bg-indigo-500 text-white"
                                            : isTimeDisabled(hour, selectedMinute)
                                                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                                : "hover:bg-indigo-100 dark:hover:bg-indigo-900"
                                    }`}
                                    onClick={() => {
                                        if (!isTimeDisabled(hour, selectedMinute)) {
                                            setSelectedHour(hour);
                                        }
                                    }}
                                >
                                    {hour.toString().padStart(2, "0")}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-1/2">
                        <div className="text-center mb-2 text-gray-600 dark:text-gray-300">Minutes</div>
                        <div className="h-48 overflow-y-auto border rounded-md border-gray-200 dark:border-gray-700">
                            {minutes.map((minute) => (
                                <div
                                    key={minute}
                                    className={`py-2 text-center cursor-pointer ${
                                        selectedMinute === minute
                                            ? "bg-indigo-500 text-white"
                                            : isTimeDisabled(selectedHour, minute)
                                                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                                : "hover:bg-indigo-100 dark:hover:bg-indigo-900"
                                    }`}
                                    onClick={() => {
                                        if (!isTimeDisabled(selectedHour, minute)) {
                                            setSelectedMinute(minute);
                                        }
                                    }}
                                >
                                    {minute.toString().padStart(2, "0")}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="text-center font-semibold text-lg mb-4">
                    {selectedHour.toString().padStart(2, "0")}:{selectedMinute.toString().padStart(2, "0")} (UTC+1)
                </div>
            </div>
        );
    };

    // Format the display value in UTC+1
    const getDisplayValue = () => {
        if (!value) return "";

        // Add UTC+1 label to the display
        return `${format(value, "dd.MM.yyyy HH:mm")} (UTC+1)`;
    };

    return (
        <div className="relative" ref={pickerRef}>
            <div
                className={`border rounded-xl p-2 flex items-center justify-between ${disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={togglePicker}>
                <div className="flex items-center">
                    {view === "date" ? (
                        <Calendar className="h-5 w-5 mr-2 text-gray-500"/>
                    ) : (
                        <Clock className="h-5 w-5 mr-2 text-gray-500"/>
                    )}
                    <input
                        type="text"
                        readOnly
                        disabled={disabled}
                        className="outline-none bg-transparent cursor-pointer w-full"
                        placeholder={placeholder}
                        value={getDisplayValue()}
                    />
                </div>
                {value && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                )}
            </div>

            {isOpen && (
                <div
                    className="absolute z-10 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-72 border border-gray-200 dark:border-gray-700">
                    {view === "date" ? renderCalendar() : renderTimePicker()}

                    <div className="flex justify-between p-3 border-t border-gray-200 dark:border-gray-700">
                        {view === "date" ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView("time")}
                                    className="px-3 py-1 bg-indigo-500 text-white hover:bg-indigo-600 rounded-md"
                                >
                                    Set Time
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setView("date")}
                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleTimeChange}
                                    className="px-3 py-1 bg-indigo-500 text-white hover:bg-indigo-600 rounded-md"
                                >
                                    Confirm
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateTimePicker;