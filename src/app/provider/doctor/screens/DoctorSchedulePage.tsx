import { useEffect, useMemo, useState } from 'react';
import { toGregorian, toJalaali, jalaaliMonthLength } from 'jalaali-js';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { PageHeader } from '../../components';
import { JalaliCalendar } from '../../components/JalaliCalendar';
import {
    formatJalali,
    todayJalali,
    toFaDigits,
    type JalaliDate,
} from '../../utils/jalali';
import { useDoctorAuthStore } from "../store/doctorAuthStore";

const API_BASE_URL = 'https://api.mediraai.com/api';

const WEEKDAYS = [
    { label: 'شنبه', value: 6 },
    { label: 'یکشنبه', value: 0 },
    { label: 'دوشنبه', value: 1 },
    { label: 'سه‌شنبه', value: 2 },
    { label: 'چهارشنبه', value: 3 },
    { label: 'پنج‌شنبه', value: 4 },
    { label: 'جمعه', value: 5 },
];

const SLOT_DURATIONS = [5, 10, 15, 20, 25, 30];

interface CalendarSummaryItem {
    slot_date: string;
    total_slots: number;
    available_slots: number;
    booked_slots: number;
    blocked_slots: number;
    done_slots: number;
}

interface DoctorSlot {
    id: number;
    slot_date: string;
    start_time: string;
    end_time: string;
    status: 'available' | 'booked' | 'blocked' | 'done';
    price: number | null;
    patient_id: number | null;
    patient_name: string | null;
    patient_phone: string | null;
}

interface ShiftTime {
    start: string;
    end: string;
}

interface DayRule {
    slot_minutes: number;
    shifts: ShiftTime[];
}

type WeekRules = Record<number, DayRule>;

// ساخت قوانین پیش‌فرض برای تمام ۷ روز هفته
const defaultWeekRules: WeekRules = WEEKDAYS.reduce((acc, curr) => {
    acc[curr.value] = { slot_minutes: 15, shifts: [{ start: '08:00', end: '12:00' }] };
    return acc;
}, {} as WeekRules);

function jalaliToGregorianString(d: JalaliDate): string {
    const g = toGregorian(d.jy, d.jm, d.jd);
    return `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`;
}

function gregorianToJalaliKey(date: string): string {
    const [gy, gm, gd] = date.split('-').map(Number);
    const j = toJalaali(gy, gm, gd);
    return `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`;
}

function timeLabel(time: string): string {
    const [h, m] = time.split(':');
    return toFaDigits(`${h}:${m}`);
}

export function DoctorSchedulePage() {
    const today = todayJalali();
    const token = useDoctorAuthStore((s) => s.token);

    // وضعیت‌های اصلی تقویم
    const [selectedDate, setSelectedDate] = useState<JalaliDate>(today);
    const [calendarSummary, setCalendarSummary] = useState<CalendarSummaryItem[]>([]);
    const [slots, setSlots] = useState<DoctorSlot[]>([]);

    // وضعیت‌های لودینگ
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [generatingSlots, setGeneratingSlots] = useState(false);
    const [applyingRules, setApplyingRules] = useState(false); // جایگزین saving و batch generating
    const [togglingSlotId, setTogglingSlotId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // وضعیت قوانین هر روز
    const [weekRules, setWeekRules] = useState<WeekRules>(defaultWeekRules);
    const [activeTab, setActiveTab] = useState<number>(6); // پیش‌فرض: تب شنبه فعال باشد

    const selectedKey = formatJalali(selectedDate);
    const selectedGregorianDate = useMemo(() => jalaliToGregorianString(selectedDate), [selectedDate]);

    const authHeaders = useMemo(() => ({
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
    }), [token]);

    const markedDates = useMemo(() => {
        const map: Record<string, string> = {};
        for (const item of calendarSummary) {
            const booked = item.booked_slots > 0 ? toFaDigits(item.booked_slots) : '';
            const done = item.done_slots > 0 ? toFaDigits(item.done_slots) : '';
            const available = item.available_slots > 0 ? toFaDigits(item.available_slots) : '';
            map[gregorianToJalaliKey(item.slot_date)] = `${booked}\n${done}\n${available}`;
        }
        return map;
    }, [calendarSummary]);

    const dayAppointments = useMemo(() => slots.filter((slot) => slot.status === 'booked' || slot.status === 'done'), [slots]);
    const dayOff = useMemo(() => slots.length > 0 && slots.every((slot) => slot.status === 'blocked'), [slots]);

    // ==========================================
    // دریافت قوانین از Redis
    // ==========================================
    async function loadRules() {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/doctor/schedule/rules`, { method: 'GET', headers: authHeaders });
            const result = await res.json();
            if (res.ok && result.data) {
                setWeekRules(prev => ({ ...prev, ...result.data }));
            }
        } catch (err) {
            console.error('Failed to load rules');
        }
    }

    // ==========================================
    // توابع کمکی تغییر قوانین (مربوط به تب فعال)
    // ==========================================
    const currentRule = weekRules[activeTab];

    const updateActiveRule = (updates: Partial<DayRule>) => {
        setWeekRules(prev => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], ...updates }
        }));
    };

    const updateActiveShift = (index: number, field: 'start' | 'end', value: string) => {
        const newShifts = [...currentRule.shifts];
        newShifts[index][field] = value;
        updateActiveRule({ shifts: newShifts });
    };

    const addActiveShift = () => {
        if (currentRule.shifts.length < 4) {
            updateActiveRule({ shifts: [...currentRule.shifts, { start: '10:00', end: '14:00' }] });
        }
    };

    const removeActiveShift = (index: number) => {
        updateActiveRule({ shifts: currentRule.shifts.filter((_, i) => i !== index) });
    };

    // ==========================================
    // متدهای دریافت اطلاعات از سرور
    // ==========================================
    async function fetchCalendarSummary() {
        if (!token) return;
        setLoadingSummary(true);
        try {
            const res = await fetch(`${API_BASE_URL}/doctor/schedule/calendar-summary`, { method: 'GET', headers: authHeaders });
            const result = await res.json();
            if (res.ok && result.status) setCalendarSummary(result.data ?? []);
        } finally { setLoadingSummary(false); }
    }

    async function fetchSlotsByDate(date: string) {
        if (!token) return;
        setLoadingSlots(true);
        try {
            const res = await fetch(`${API_BASE_URL}/doctor/schedule/slots?date=${encodeURIComponent(date)}`, { method: 'GET', headers: authHeaders });
            const result = await res.json();
            if (res.ok && result.status) setSlots(result.data?.slots ?? []);
        } finally { setLoadingSlots(false); }
    }

    // ==========================================
    // اعمال قوانین روی "تک روز انتخاب شده" در تقویم
    // ==========================================
    async function generateSlotsForSelectedDate() {
        if (!token) return;

        const g = toGregorian(selectedDate.jy, selectedDate.jm, selectedDate.jd);
        const jsDate = new Date(g.gy, g.gm - 1, g.gd);
        const dayOfWeek = jsDate.getDay();
        const ruleForThisDay = weekRules[dayOfWeek];

        setGeneratingSlots(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await fetch(`${API_BASE_URL}/doctor/schedule/generate-slots`, {
                method: 'POST',
                headers: { ...authHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: selectedGregorianDate,
                    slot_minutes: ruleForThisDay.slot_minutes,
                    shifts: ruleForThisDay.shifts
                }),
            });
            const result = await res.json();
            if (!res.ok || !result.status) throw new Error(result.message || 'خطا در ساخت اسلات‌ها');

            await Promise.all([fetchSlotsByDate(selectedGregorianDate), fetchCalendarSummary()]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'خطا در ساخت اسلات‌ها');
        } finally {
            setGeneratingSlots(false);
        }
    }

    // ==========================================
    // اعمال ترکیبی (ذخیره در ردیس + تولید گروهی)
    // ==========================================
    function getDatesForBatchTarget(): string[] {
        const dates: string[] = [];
        const length = jalaaliMonthLength(selectedDate.jy, selectedDate.jm);

        for (let jd = 1; jd <= length; jd++) {
            const g = toGregorian(selectedDate.jy, selectedDate.jm, jd);
            const jsDate = new Date(g.gy, g.gm - 1, g.gd);
            if (jsDate.getDay() === activeTab) {
                dates.push(`${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`);
            }
        }
        return dates;
    }

    async function handleApplyRules() {
        if (!token) return;
        const targetDates = getDatesForBatchTarget();

        if (targetDates.length === 0) {
            setError('تاریخی یافت نشد.');
            return;
        }

        setApplyingRules(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // ۱. ذخیره قوانین در ردیس
            const saveRes = await fetch(`${API_BASE_URL}/doctor/schedule/rules`, {
                method: 'POST',
                headers: { ...authHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ rules: weekRules }),
            });
            const saveResult = await saveRes.json();
            if (!saveRes.ok || !saveResult.status) throw new Error(saveResult.message || 'خطا در ذخیره قوانین');

            // ۲. تولید اسلات‌های گروهی برای این تب
            const genRes = await fetch(`${API_BASE_URL}/doctor/schedule/generate-slots-batch`, {
                method: 'POST',
                headers: { ...authHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dates: targetDates,
                    slot_minutes: currentRule.slot_minutes,
                    shifts: currentRule.shifts
                }),
            });
            const genResult = await genRes.json();
            if (!genRes.ok || !genResult.status) throw new Error(genResult.message || 'خطا در تولید گروهی');

            // به‌روزرسانی تقویم
            await fetchCalendarSummary();
            if (targetDates.includes(selectedGregorianDate)) {
                await fetchSlotsByDate(selectedGregorianDate);
            }

            // نمایش پیام موفقیت موقت به جای Alert
            setSuccessMessage(`قوانین با موفقیت ذخیره و برای تمام ${WEEKDAYS.find(w => w.value === activeTab)?.label}‌های این ماه اعمال شد.`);
            setTimeout(() => setSuccessMessage(null), 5000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'خطا در اعمال قوانین');
        } finally {
            setApplyingRules(false);
        }
    }

    async function toggleSlot(slot: DoctorSlot) {
        if (!token) return;
        if (slot.status === 'booked' || slot.status === 'done') return;
        setTogglingSlotId(slot.id);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/doctor/schedule/slots/${slot.id}/toggle-status`, { method: 'PATCH', headers: authHeaders });
            const result = await res.json();
            if (res.ok && result.status) {
                setSlots(prev => prev.map(item => item.id === slot.id ? { ...item, status: result.data?.status ?? item.status } : item));
                await fetchCalendarSummary();
            }
        } finally { setTogglingSlotId(null); }
    }

    async function toggleDayOff(nextChecked: boolean) {
        if (!slots.length) return setError('ابتدا برای این روز اسلات ایجاد کنید');
        const targetSlots = slots.filter(slot => nextChecked ? slot.status === 'available' : slot.status === 'blocked');
        for (const slot of targetSlots) await toggleSlot(slot);
        await Promise.all([fetchSlotsByDate(selectedGregorianDate), fetchCalendarSummary()]);
    }

    useEffect(() => {
        loadRules();
        fetchCalendarSummary();
    }, [token]);

    useEffect(() => {
        fetchSlotsByDate(selectedGregorianDate);
    }, [selectedGregorianDate, token]);

    return (
        <div className="space-y-6">
            <PageHeader title="برنامه زمانی" description="تقویم شمسی، تنظیم قوانین کاری و زمان‌های آزاد" />

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 transition-all">
                    <CheckCircle className="h-4 w-4" />
                    {successMessage}
                </div>
            )}

            {/* بخش تنظیمات قوانین (Tabs) */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 p-4">
                    <h3 className="mb-4 text-base font-semibold text-slate-800">
                        قوانین ویزیت و شیفت کاری
                    </h3>

                    {/* تب‌های افقی روزهای هفته */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {WEEKDAYS.map((w) => (
                            <button
                                key={w.value}
                                onClick={() => setActiveTab(w.value)}
                                className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
                                    activeTab === w.value
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {w.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* فرم زیر تب فعال */}
                <div className="p-5 md:p-6">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {/* ستون اول: تنظیمات زمان */}
                        <div className="border-l border-slate-100 pl-6">
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                مدت هر ویزیت (روز {WEEKDAYS.find(w => w.value === activeTab)?.label})
                            </label>
                            <select
                                value={currentRule.slot_minutes}
                                onChange={(e) => updateActiveRule({ slot_minutes: Number(e.target.value) })}
                                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500"
                            >
                                {SLOT_DURATIONS.map(v => (
                                    <option key={v} value={v}>{toFaDigits(v)} دقیقه</option>
                                ))}
                            </select>
                        </div>

                        {/* ستون دوم و سوم: شیفت‌ها */}
                        <div className="lg:col-span-2">
                            <div className="mb-4 flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700">بازه زمانی شیفت‌ها</label>
                                {currentRule.shifts.length < 4 && (
                                    <button onClick={addActiveShift} type="button" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                        <Plus className="h-3.5 w-3.5" /> افزودن شیفت
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {currentRule.shifts.map((shift, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <input
                                            type="time"
                                            value={shift.start}
                                            onChange={(e) => updateActiveShift(idx, 'start', e.target.value)}
                                            className="w-full max-w-[150px] rounded-xl border border-slate-200 p-2 text-sm text-center font-medium focus:border-blue-500 outline-none"
                                            dir="ltr"
                                        />
                                        <span className="text-slate-400 text-sm">تا</span>
                                        <input
                                            type="time"
                                            value={shift.end}
                                            onChange={(e) => updateActiveShift(idx, 'end', e.target.value)}
                                            className="w-full max-w-[150px] rounded-xl border border-slate-200 p-2 text-sm text-center font-medium focus:border-blue-500 outline-none"
                                            dir="ltr"
                                        />
                                        {currentRule.shifts.length > 1 && (
                                            <button onClick={() => removeActiveShift(idx)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="حذف شیفت">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* دکمه ترکیبی اعمال قوانین */}
                    <div className="mt-8 border-t border-slate-100 pt-5 flex items-center justify-between">
                        <p className="text-xs text-slate-500 max-w-sm">
                            این قوانین به صورت سیستمی ذخیره شده و بازه‌های {WEEKDAYS.find(w => w.value === activeTab)?.label}‌های ماهی که در تقویم پایین مشاهده می‌کنید ساخته خواهند شد.
                        </p>
                        <button
                            type="button"
                            onClick={handleApplyRules}
                            disabled={applyingRules}
                            className="rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-900 disabled:opacity-60"
                        >
                            {applyingRules ? 'در حال اعمال...' : `اعمال قوانین ${WEEKDAYS.find(w => w.value === activeTab)?.label}`}
                        </button>
                    </div>
                </div>
            </div>

            {/* بخش تقویم و ساعات روز */}
            <div className="grid gap-6 lg:grid-cols-2">
                <JalaliCalendar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    markedDates={markedDates}
                    accentClass="bg-blue-600 text-white"
                />

                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-700">
                                    ساعات کاری — {selectedKey}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    تاریخ سرور: {selectedGregorianDate}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/*<button*/}
                                {/*    type="button"*/}
                                {/*    onClick={generateSlotsForSelectedDate}*/}
                                {/*    disabled={generatingSlots}*/}
                                {/*    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"*/}
                                {/*>*/}
                                {/*    {generatingSlots ? 'در حال اعمال...' : 'اعمال قوانین برای این روز'}*/}
                                {/*</button>*/}

                                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={dayOff}
                                        onChange={(e) => toggleDayOff(e.target.checked)}
                                        disabled={!slots.length || loadingSlots}
                                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    تعطیلی روز
                                </label>
                            </div>
                        </div>

                        {loadingSlots ? (
                            <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500">در حال دریافت اسلات‌ها...</p>
                        ) : slots.length === 0 ? (
                            <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500">برای این روز اسلاتی ثبت نشده است</p>
                        ) : dayOff ? (
                            <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500">این روز تعطیل است</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {slots.map((slot) => {
                                    const booked = slot.status === 'booked' || slot.status === 'done';
                                    const blocked = slot.status === 'blocked';
                                    const isLoading = togglingSlotId === slot.id;

                                    return (
                                        <button
                                            key={slot.id}
                                            type="button"
                                            onClick={() => !booked && toggleSlot(slot)}
                                            disabled={booked || isLoading}
                                            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                                                booked ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
                                                    : blocked ? 'bg-slate-200 text-slate-500 line-through'
                                                        : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100'
                                            } disabled:cursor-not-allowed`}
                                        >
                                            {timeLabel(slot.start_time)}
                                            {slot.status === 'booked' && ' (رزرو)'}
                                            {slot.status === 'done' && ' (انجام شد)'}
                                            {isLoading && ' ...'}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* بخش نوبت های این روز */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <p className="mb-4 text-sm font-semibold text-slate-700">نوبت‌های این روز</p>
                        {loadingSlots ? (
                            <p className="text-sm text-slate-500">در حال دریافت نوبت‌ها...</p>
                        ) : dayAppointments.length === 0 ? (
                            <p className="text-sm text-slate-500">نوبتی ثبت نشده</p>
                        ) : (
                            <ul className="space-y-2">
                                {dayAppointments.map((slot) => (
                                    <li key={slot.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm bg-slate-50">
                                        <div>
                                            <span className="font-medium text-slate-800">{slot.patient_name ?? 'بیمار'}</span>
                                            {slot.patient_phone && (
                                                <span className="mr-2 text-slate-500 text-xs">{toFaDigits(slot.patient_phone)}</span>
                                            )}
                                        </div>
                                        <span className="text-slate-600 font-medium">{timeLabel(slot.start_time)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}