// JalaliCalendarModal.tsx
import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    X,
    Star,
} from 'lucide-react';
import {
    toJalaali,
    toGregorian,
    jalaaliMonthLength,
} from 'jalaali-js';

// ---------- Jalali Helpers ----------
export interface JalaliDate {
    jy: number;
    jm: number;
    jd: number;
}

export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
    const j = toJalaali(gy, gm, gd);
    return { jy: j.jy, jm: j.jm, jd: j.jd };
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
    const g = toGregorian(jy, jm, jd);
    return { gy: g.gy, gm: g.gm, gd: g.gd };
}

export function formatJalaliDate(j: JalaliDate): string {
    return `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`;
}

const PERSIAN_MONTHS = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

const PERSIAN_WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

// ---------- Jalali Calendar Component ----------
interface JalaliCalendarProps {
    selectedDate?: JalaliDate | null;
    onSelectDate?: (date: JalaliDate) => void;
    markedDates?: Record<string, string>;
    accentClass?: string;
    className?: string;
}

function JalaliCalendar({
                            selectedDate,
                            onSelectDate,
                            markedDates = {},
                            accentClass = 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md',
                            className = '',
                        }: JalaliCalendarProps) {
    const today = gregorianToJalali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
    const [viewYear, setViewYear] = useState(today.jy);
    const [viewMonth, setViewMonth] = useState(today.jm);

    const daysInMonth = jalaaliMonthLength(viewYear, viewMonth);
    const firstDayGreg = toGregorian(viewYear, viewMonth, 1);
    const firstDayDate = new Date(firstDayGreg.gy, firstDayGreg.gm - 1, firstDayGreg.gd);
    const firstDayIndex = (firstDayDate.getDay() + 1) % 7; // 0 = Saturday

    const weeks: (JalaliDate | null)[][] = [];
    let currentWeek: (JalaliDate | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) currentWeek.push(null);
    for (let jd = 1; jd <= daysInMonth; jd++) {
        currentWeek.push({ jy: viewYear, jm: viewMonth, jd });
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
    }

    const goPrevMonth = () => {
        if (viewMonth === 1) {
            setViewYear(y => y - 1);
            setViewMonth(12);
        } else {
            setViewMonth(m => m - 1);
        }
    };

    const goNextMonth = () => {
        if (viewMonth === 12) {
            setViewYear(y => y + 1);
            setViewMonth(1);
        } else {
            setViewMonth(m => m + 1);
        }
    };

    const goToday = () => {
        setViewYear(today.jy);
        setViewMonth(today.jm);
        onSelectDate?.(today);
    };

    return (
        <div className={`rounded-2xl bg-white p-4 ${className}`}>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button type="button" onClick={goPrevMonth} className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <h3 className="min-w-[140px] text-center text-base font-bold text-gray-800">
                        {PERSIAN_MONTHS[viewMonth - 1]} {viewYear}
                    </h3>
                    <button type="button" onClick={goNextMonth} className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                </div>
                <button type="button" onClick={goToday} className="rounded-xl bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-600 hover:bg-pink-100">
                    امروز
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400">
                {PERSIAN_WEEKDAYS_SHORT.map((d) => (
                    <div key={d} className="py-2">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {weeks.flat().map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;
                    const key = formatJalaliDate(day);
                    const isToday = day.jy === today.jy && day.jm === today.jm && day.jd === today.jd;
                    const isSelected = selectedDate && day.jy === selectedDate.jy && day.jm === selectedDate.jm && day.jd === selectedDate.jd;
                    const isMarked = Boolean(markedDates[key]);
                    const markContent = markedDates[key];

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onSelectDate?.(day)}
                            className={`relative flex aspect-square flex-col items-center justify-center rounded-xl p-1 transition ${
                                isSelected
                                    ? accentClass
                                    : isToday
                                        ? 'bg-pink-50 text-pink-700 ring-1 ring-pink-200'
                                        : isMarked
                                            ? 'bg-pink-100/70 text-pink-700 hover:bg-pink-200/70'
                                            : 'text-gray-700 hover:bg-pink-50'
                            }`}
                        >
                            {isMarked && markContent === 'period' && (
                                <span className="absolute top-1 left-1 text-[8px]">🌸</span>
                            )}
                            {isMarked && markContent === 'next_period' && (
                                <Star className="absolute top-1 left-1 h-3 w-3 text-rose-500" />
                            )}
                            <span className={`text-sm font-medium ${isSelected ? 'text-white' : ''}`}>
                                {day.jd}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ---------- Jalali Calendar Modal Component ----------
interface JalaliCalendarModalProps {
    open: boolean;
    onClose: () => void;
    selectedDate: JalaliDate | null;
    onSelectDate: (date: JalaliDate) => void;
    markedDates?: Record<string, string>;
}

export function JalaliCalendarModal({
                                        open,
                                        onClose,
                                        selectedDate,
                                        onSelectDate,
                                        markedDates = {},
                                    }: JalaliCalendarModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 px-4 pb-6 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">تقویم شمسی</h3>
                    <button onClick={onClose} className="rounded-full bg-gray-50 p-2 text-gray-400">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <JalaliCalendar
                    selectedDate={selectedDate}
                    onSelectDate={onSelectDate}
                    markedDates={markedDates}
                    accentClass="bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md"
                />
            </div>
        </div>
    );
}