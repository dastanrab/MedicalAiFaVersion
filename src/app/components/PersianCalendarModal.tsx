import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import {
    getPersianMonthKey,
    getPersianMonthDisplay,
    getPersianParts,
    findFirstDayOfPersianMonth,
    shiftPersianMonth,
    toGregorianString,
} from '../utils/persianDate';
import { WEEK_DAYS } from '../constants/periodTracker';

interface PersianCalendarModalProps {
    open: boolean;
    selectedDate: Date;
    onClose: () => void;
    onSelect: (date: Date) => void;
}

export default function PersianCalendarModal({ open, selectedDate, onClose, onSelect }: PersianCalendarModalProps) {
    const [monthStart, setMonthStart] = useState<Date>(() => findFirstDayOfPersianMonth(selectedDate));

    useEffect(() => {
        if (open) {
            setMonthStart(findFirstDayOfPersianMonth(selectedDate));
        }
    }, [open, selectedDate]);

    const days = useMemo(() => {
        const cells: Array<{ date: Date; day: number } | null> = [];
        const start = new Date(monthStart);
        const startWeekIndex = (start.getDay() + 1) % 7; // شنبه = 0
        for (let i = 0; i < startWeekIndex; i++) {
            cells.push(null);
        }
        for (let i = 0; i < 31; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            if (getPersianMonthKey(d) !== getPersianMonthKey(start)) break;
            const persian = getPersianParts(d);
            cells.push({ date: d, day: persian.day });
        }
        return cells;
    }, [monthStart]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 px-4 pb-6 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">تقویم شمسی</h3>
                    <button type="button" onClick={onClose} className="rounded-full bg-gray-50 p-2 text-gray-400 hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setMonthStart(shiftPersianMonth(monthStart, -1))}
                        className="rounded-full bg-pink-50 p-2 text-pink-600 hover:bg-pink-100"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-bold text-gray-700">{getPersianMonthDisplay(monthStart)}</span>
                    <button
                        type="button"
                        onClick={() => setMonthStart(shiftPersianMonth(monthStart, 1))}
                        className="rounded-full bg-pink-50 p-2 text-pink-600 hover:bg-pink-100"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                    {WEEK_DAYS.map((day) => (
                        <div key={day} className="py-1 text-xs font-bold text-gray-400">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                    {days.map((cell, idx) => {
                        if (!cell) {
                            return <div key={`empty-${idx}`} />;
                        }
                        const dateObj = cell.date;
                        const isToday = toGregorianString(dateObj) === toGregorianString(new Date());
                        const isSelected = toGregorianString(dateObj) === toGregorianString(selectedDate);
                        return (
                            <button
                                key={toGregorianString(dateObj)}
                                type="button"
                                onClick={() => {
                                    onSelect(new Date(dateObj));
                                    onClose();
                                }}
                                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                                    isSelected
                                        ? 'bg-gradient-to-br from-pink-500 to-rose-500 font-bold text-white shadow-md'
                                        : isToday
                                            ? 'bg-pink-100 font-bold text-pink-600'
                                            : 'text-gray-700 hover:bg-pink-50'
                                }`}
                            >
                                {cell.day}
                            </button>
                        );
                    })}
                </div>

                <Button className="mt-5 h-11 w-full rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100" onClick={onClose}>
                    بستن
                </Button>
            </div>
        </div>
    );
}