import { useEffect, useMemo, useState } from 'react';
import { toGregorian, toJalaali } from 'jalaali-js';
import { PageHeader } from '../../components';
import { JalaliCalendar } from '../../components/JalaliCalendar';
import {
    formatJalali,
    todayJalali,
    toFaDigits,
    type JalaliDate,
} from '../../utils/jalali';
import {useDoctorAuthStore} from "../store/doctorAuthStore";

const API_BASE_URL = 'http://185.222.163.113:7000/api';

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
    notes: string | null;
}

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

    const [selectedDate, setSelectedDate] = useState<JalaliDate>(today);
    const [calendarSummary, setCalendarSummary] = useState<CalendarSummaryItem[]>([]);
    const [slots, setSlots] = useState<DoctorSlot[]>([]);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [generatingSlots, setGeneratingSlots] = useState(false);
    const [togglingSlotId, setTogglingSlotId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const selectedKey = formatJalali(selectedDate);
    const selectedGregorianDate = useMemo(
        () => jalaliToGregorianString(selectedDate),
        [selectedDate]
    );

    const authHeaders = useMemo(
        () => ({
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        }),
        [token]
    );

    const markedDates = useMemo(() => {
        const map: Record<string, number> = {};
        for (const item of calendarSummary) {
            map[gregorianToJalaliKey(item.slot_date)] = Number(item.total_slots);
        }
        return map;
    }, [calendarSummary]);

    const dayAppointments = useMemo(
        () => slots.filter((slot) => slot.status === 'booked' || slot.status === 'done'),
        [slots]
    );

    const dayOff = useMemo(
        () => slots.length > 0 && slots.every((slot) => slot.status === 'blocked'),
        [slots]
    );

    async function fetchCalendarSummary() {
        if (!token) return;

        setLoadingSummary(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/doctor/schedule/calendar-summary`, {
                method: 'GET',
                headers: authHeaders,
            });

            const result = await res.json();

            if (!res.ok || !result.status) {
                throw new Error(result.message || 'خطا در دریافت خلاصه تقویم');
            }

            setCalendarSummary(result.data ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'خطا در دریافت خلاصه تقویم');
        } finally {
            setLoadingSummary(false);
        }
    }

    async function fetchSlotsByDate(date: string) {
        if (!token) return;

        setLoadingSlots(true);
        setError(null);

        try {
            const res = await fetch(
                `${API_BASE_URL}/doctor/schedule/slots?date=${encodeURIComponent(date)}`,
                {
                    method: 'GET',
                    headers: authHeaders,
                }
            );

            const result = await res.json();

            if (!res.ok || !result.status) {
                throw new Error(result.message || 'خطا در دریافت اسلات‌های روز');
            }

            setSlots(result.data?.slots ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'خطا در دریافت اسلات‌های روز');
        } finally {
            setLoadingSlots(false);
        }
    }

    async function generateSlotsForSelectedDate() {
        if (!token) return;

        setGeneratingSlots(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/doctor/schedule/generate-slots`, {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: selectedGregorianDate,
                }),
            });

            const result = await res.json();

            if (!res.ok || !result.status) {
                throw new Error(result.message || 'خطا در ساخت اسلات‌ها');
            }

            await Promise.all([
                fetchSlotsByDate(selectedGregorianDate),
                fetchCalendarSummary(),
            ]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'خطا در ساخت اسلات‌ها');
        } finally {
            setGeneratingSlots(false);
        }
    }

    async function toggleSlot(slot: DoctorSlot) {
        if (!token) return;
        if (slot.status === 'booked' || slot.status === 'done') return;

        setTogglingSlotId(slot.id);
        setError(null);

        try {
            const res = await fetch(
                `${API_BASE_URL}/doctor/schedule/slots/${slot.id}/toggle-status`,
                {
                    method: 'PATCH',
                    headers: authHeaders,
                }
            );

            const result = await res.json();

            if (!res.ok || !result.status) {
                throw new Error(result.message || 'خطا در تغییر وضعیت اسلات');
            }

            setSlots((prev) =>
                prev.map((item) =>
                    item.id === slot.id
                        ? { ...item, status: result.data?.status ?? item.status }
                        : item
                )
            );

            await fetchCalendarSummary();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'خطا در تغییر وضعیت اسلات');
        } finally {
            setTogglingSlotId(null);
        }
    }

    async function toggleDayOff(nextChecked: boolean) {
        if (!slots.length) {
            setError('ابتدا برای این روز اسلات ایجاد کنید');
            return;
        }

        const targetSlots = slots.filter((slot) =>
            nextChecked ? slot.status === 'available' : slot.status === 'blocked'
        );

        for (const slot of targetSlots) {
            await toggleSlot(slot);
        }

        await Promise.all([
            fetchSlotsByDate(selectedGregorianDate),
            fetchCalendarSummary(),
        ]);
    }

    useEffect(() => {
        fetchCalendarSummary();
    }, [token]);

    useEffect(() => {
        fetchSlotsByDate(selectedGregorianDate);
    }, [selectedGregorianDate, token]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="برنامه زمانی"
                description="تقویم شمسی، ساعات کاری و زمان‌های آزاد"
            />

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

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
                                <button
                                    type="button"
                                    onClick={generateSlotsForSelectedDate}
                                    disabled={generatingSlots}
                                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {generatingSlots ? 'در حال ساخت...' : 'ساخت اسلات‌های روز'}
                                </button>

                                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={dayOff}
                                        onChange={(e) => toggleDayOff(e.target.checked)}
                                        disabled={!slots.length || loadingSlots}
                                        className="h-4 w-4 rounded"
                                    />
                                    تعطیلی روز
                                </label>
                            </div>
                        </div>

                        {loadingSlots ? (
                            <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                                در حال دریافت اسلات‌ها...
                            </p>
                        ) : slots.length === 0 ? (
                            <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                                برای این روز اسلاتی ثبت نشده است
                            </p>
                        ) : dayOff ? (
                            <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                                این روز تعطیل است
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {slots.map((slot) => {
                                    const booked =
                                        slot.status === 'booked' || slot.status === 'done';
                                    const blocked = slot.status === 'blocked';
                                    const isLoading = togglingSlotId === slot.id;

                                    return (
                                        <button
                                            key={slot.id}
                                            type="button"
                                            onClick={() => !booked && toggleSlot(slot)}
                                            disabled={booked || isLoading}
                                            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                                                booked
                                                    ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
                                                    : blocked
                                                        ? 'bg-slate-200 text-slate-500 line-through'
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

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <p className="mb-4 text-sm font-semibold text-slate-700">نوبت‌های این روز</p>

                        {loadingSlots ? (
                            <p className="text-sm text-slate-500">در حال دریافت نوبت‌ها...</p>
                        ) : dayAppointments.length === 0 ? (
                            <p className="text-sm text-slate-500">نوبتی ثبت نشده</p>
                        ) : (
                            <ul className="space-y-2">
                                {dayAppointments.map((slot) => (
                                    <li
                                        key={slot.id}
                                        className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm"
                                    >
                                        <div>
                                            <span className="font-medium">
                                                {slot.patient_name ?? 'بیمار'}
                                            </span>
                                            {slot.patient_phone && (
                                                <span className="mr-2 text-slate-500">
                                                    {toFaDigits(slot.patient_phone)}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-slate-500">
                                            {timeLabel(slot.start_time)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {loadingSummary && (
                        <p className="text-xs text-slate-400">
                            در حال به‌روزرسانی اطلاعات تقویم...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
