import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    addJalaliMonths,
    formatJalali,
    getMonthGrid,
    isSameJalaliDay,
    PERSIAN_MONTHS,
    PERSIAN_WEEKDAYS_SHORT,
    todayJalali,
    toFaDigits,
    type JalaliDate,
} from '../utils/jalali';

export interface JalaliCalendarProps {
    selectedDate?: JalaliDate | null;
    onSelectDate?: (date: JalaliDate) => void;
    markedDates?: Record<string, string>;
    workingDays?: Set<string>;
    accentClass?: string;
    className?: string;
}

export function JalaliCalendar({
                                   selectedDate,
                                   onSelectDate,
                                   markedDates = {},
                                   workingDays,
                                   accentClass = 'bg-rose-600 text-white',
                                   className = '',
                               }: JalaliCalendarProps) {
    const today = todayJalali();
    const [viewMonth, setViewMonth] = useState<JalaliDate>({ jy: today.jy, jm: today.jm, jd: 1 });

    const weeks = useMemo(
        () => getMonthGrid(viewMonth.jy, viewMonth.jm),
        [viewMonth.jy, viewMonth.jm]
    );

    const goPrev = () => setViewMonth((m) => addJalaliMonths(m, -1));
    const goNext = () => setViewMonth((m) => addJalaliMonths(m, 1));
    const goToday = () => {
        const t = todayJalali();
        setViewMonth({ jy: t.jy, jm: t.jm, jd: 1 });
        onSelectDate?.(t);
    };

    return (
        <div className={`rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 ${className}`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={goPrev}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                        aria-label="ماه قبل"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <h3 className="min-w-[140px] text-center text-base font-semibold text-slate-800">
                        {PERSIAN_MONTHS[viewMonth.jm - 1]} {toFaDigits(viewMonth.jy)}
                    </h3>
                    <button
                        type="button"
                        onClick={goNext}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                        aria-label="ماه بعد"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                </div>
                <button
                    type="button"
                    onClick={goToday}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                    امروز
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
                {PERSIAN_WEEKDAYS_SHORT.map((d) => (
                    <div key={d} className="py-2">
                        {d}
                    </div>
                ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
                {weeks.flat().map((day, idx) => {
                    if (!day) {
                        return <div key={`empty-${idx}`} className="min-h-[85px]" />;
                    }

                    const key = formatJalali(day);
                    const isToday = isSameJalaliDay(day, today);
                    const isSelected = selectedDate ? isSameJalaliDay(day, selectedDate) : false;
                    const statsText = markedDates[key];
                    const isWorking = workingDays ? workingDays.has(key) : true;

                    // استخراج داده‌ها از استرینگ تولید شده (رزرو \n انجام \n آزاد)
                    const statsParts = statsText ? statsText.split('\n') : [];
                    const bookedStr = statsParts[0] || '';
                    const doneStr = statsParts[1] || '';
                    const availableStr = statsParts[2] || '';

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onSelectDate?.(day)}
                            className={`relative flex min-h-[85px] w-full flex-col items-center justify-center rounded-xl p-2 transition overflow-hidden ${
                                isSelected
                                    ? accentClass
                                    : isToday
                                        ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                                        : isWorking
                                            ? 'text-slate-700 hover:bg-slate-50'
                                            : 'bg-slate-50 text-slate-400'
                            }`}
                        >
                            {/* متن‌های آمار در صورت وجود */}
                            {statsText && (
                                <>
                                    {/* رزرو شده: بالا راست */}
                                    <span className={`absolute right-1.5 top-1.5 text-[12px] font-medium leading-none ${isSelected ? 'text-white/90' : 'text-blue-600'}`}>
                                        {bookedStr}
                                    </span>

                                    {/* انجام شده: بالا چپ */}
                                    <span className={`absolute left-1.5 top-1.5 text-[12px] font-medium leading-none ${isSelected ? 'text-white/90' : 'text-emerald-600'}`}>
                                        {doneStr}
                                    </span>

                                    {/* آزاد: پایین وسط */}
                                    <span className={`absolute bottom-1.5 inset-x-0 text-center text-[12px] font-medium leading-none ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                                        {availableStr}
                                    </span>
                                </>
                            )}

                            {/* شماره روز: وسط */}
                            <span className="text-lg font-semibold">{toFaDigits(day.jd)}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
