import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Flower, Sparkles, Droplets, Heart } from 'lucide-react';
import { jalaaliMonthLength } from 'jalaali-js';
import { JalaliDate, formatJalaliDate, jalaliToGregorian, getLocalDateString } from '../utils/jalaliHelpers';

interface CyclePhases {
    periodDates: Set<string>;
    fertileDates: Set<string>;
    ovulationDates: Set<string>;
}

interface PeriodMonthStripProps {
    viewJalali: JalaliDate;
    onViewJalaliChange: React.Dispatch<React.SetStateAction<JalaliDate>>;
    selectedJalali: JalaliDate;
    selectedJalaliString: string;
    todayJalali: JalaliDate;
    targetJalali: JalaliDate | null;
    cyclePhases: CyclePhases;
    hasSymptomLog: boolean;
    onDaySelect: (day: JalaliDate) => void;
}

export const PeriodMonthStrip: React.FC<PeriodMonthStripProps> = ({
                                                                      viewJalali,
                                                                      onViewJalaliChange,
                                                                      selectedJalali,
                                                                      selectedJalaliString,
                                                                      todayJalali,
                                                                      targetJalali,
                                                                      cyclePhases,
                                                                      hasSymptomLog,
                                                                      onDaySelect,
                                                                  }) => {
    const shiftJalaliMonth = (jalali: JalaliDate, delta: number): JalaliDate => {
        const totalMonths = jalali.jy * 12 + (jalali.jm - 1) + delta;
        const jy = Math.floor(totalMonths / 12);
        const jm = (totalMonths % 12) + 1;
        return { jy, jm, jd: 1 };
    };

    const monthDays = useMemo(() => {
        const days: JalaliDate[] = [];
        const daysInMonth = jalaaliMonthLength(viewJalali.jy, viewJalali.jm);
        for (let d = 1; d <= daysInMonth; d++) {
            days.push({ jy: viewJalali.jy, jm: viewJalali.jm, jd: d });
        }
        return days;
    }, [viewJalali]);

    return (
        <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-pink-50">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onViewJalaliChange(prev => shiftJalaliMonth(prev, -1))}
                        className="p-1 rounded-lg hover:bg-pink-50 text-gray-500 transition-colors"
                        aria-label="ماه قبل"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    <h2 className="text-sm font-bold text-gray-800">
                        {viewJalali.jy}/{String(viewJalali.jm).padStart(2, '0')}
                    </h2>

                    <button
                        type="button"
                        onClick={() => onViewJalaliChange(prev => shiftJalaliMonth(prev, 1))}
                        className="p-1 rounded-lg hover:bg-pink-50 text-gray-500 transition-colors"
                        aria-label="ماه بعد"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                </div>

                <span className="text-xs text-gray-400">{selectedJalaliString}</span>
            </div>

            <div className="flex flex-wrap gap-1.5" dir="rtl">
                {monthDays.map((day) => {
                    const key = formatJalaliDate(day);
                    const isSelected =
                        day.jy === selectedJalali.jy &&
                        day.jm === selectedJalali.jm &&
                        day.jd === selectedJalali.jd;

                    const isToday =
                        day.jy === todayJalali.jy &&
                        day.jm === todayJalali.jm &&
                        day.jd === todayJalali.jd;

                    const isPast =
                        day.jy < todayJalali.jy ||
                        (day.jy === todayJalali.jy && day.jm < todayJalali.jm) ||
                        (day.jy === todayJalali.jy && day.jm === todayJalali.jm && day.jd < todayJalali.jd);

                    const isTarget =
                        targetJalali &&
                        day.jy === targetJalali.jy &&
                        day.jm === targetJalali.jm &&
                        day.jd === targetJalali.jd;

                    const greg = jalaliToGregorian(day.jy, day.jm, day.jd);
                    const gregDate = new Date(greg.gy, greg.gm - 1, greg.gd);
                    const gregStr = getLocalDateString(gregDate);

                    const isPeriodDay = cyclePhases.periodDates.has(gregStr);
                    const isFertileDay = cyclePhases.fertileDates.has(gregStr);
                    const isOvulationDay = cyclePhases.ovulationDates.has(gregStr);
                    const isIntimateDay = !isPeriodDay && !isFertileDay && !isOvulationDay;

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onDaySelect(day)}
                            className={`relative flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                                isSelected
                                    ? hasSymptomLog
                                        ? 'bg-gradient-to-b from-pink-500 to-rose-500 text-white shadow-md scale-105 animate-soft-pulse'
                                        : 'bg-gradient-to-b from-pink-500 to-rose-500 text-white shadow-md scale-105'
                                    : isTarget
                                        ? 'bg-white text-pink-600 ring-2 ring-pink-400 font-bold'
                                        : isPast
                                            ? 'bg-pink-100/50 text-pink-400'
                                            : isToday
                                                ? 'bg-pink-50 text-pink-700 ring-1 ring-pink-200'
                                                : 'bg-gray-50 text-gray-600 hover:bg-pink-50'
                            }`}
                        >
                            <span>{day.jd}</span>

                            {isPeriodDay && (
                                <Flower className="absolute -top-1 -left-1 h-3 w-3 text-rose-500" />
                            )}
                            {isOvulationDay && (
                                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-purple-500" />
                            )}
                            {isFertileDay && (
                                <Droplets className="absolute -bottom-1 -left-1 h-3 w-3 text-sky-500" />
                            )}
                            {isIntimateDay && (
                                <Heart className="absolute -bottom-1 -right-1 h-2.5 w-2.5 text-pink-300 opacity-70" />
                            )}

                            {isSelected && hasSymptomLog && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-white shadow" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-gray-500">
                <span className="flex items-center gap-1">
                    <Flower className="h-3 w-3 text-rose-500" /> پریود
                </span>
                <span className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-sky-500" /> باروری
                </span>
                <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-purple-500" /> تخمک‌گذاری
                </span>
                <span className="flex items-center gap-1">
                    <Heart className="h-2.5 w-2.5 text-pink-300" /> صمیمی
                </span>
            </div>
        </section>
    );
};