import { useEffect, useRef, useState } from "react";
import {
    MapPin,
    CalendarDays,
    Clock,
    Check,
    Loader2,
    CheckCircle2,
    Map as MapIcon
} from "lucide-react";

import { PageHeader } from "../../components";
import { useProviderSession } from "../../store/providerAuthStore";

import Map from "@neshan-maps-platform/ol/Map";
import View from "@neshan-maps-platform/ol/View";
import { fromLonLat, toLonLat } from "@neshan-maps-platform/ol/proj";
import { Button } from "../../../components/ui/button";

const API_BASE_URL = 'https://api.mediraai.com/api/owner/medical-center/coverage';

const WEEKDAYS = [
    { label: 'شنبه', value: 6 },
    { label: 'یکشنبه', value: 0 },
    { label: 'دوشنبه', value: 1 },
    { label: 'سه‌شنبه', value: 2 },
    { label: 'چهارشنبه', value: 3 },
    { label: 'پنج‌شنبه', value: 4 },
    { label: 'جمعه', value: 5 },
];

interface Region {
    id: number;
    name: string;
}

export default function MedicalCenterRulesPage() {
    const { token } = useProviderSession('nurse');

    // --- State: لودینگ ---
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // --- State: اطلاعات فرم (ذخیره شونده در Redis) ---
    const [activeDays, setActiveDays] = useState<number[]>([6, 0, 1, 2, 3]);
    const [workHours, setWorkHours] = useState({ start: "08:00", end: "20:00" });
    const [coverageDesc, setCoverageDesc] = useState("");
    const [radius, setRadius] = useState(8);
    const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
    const [mapLat, setMapLat] = useState<number>(35.699739);
    const [mapLng, setMapLng] = useState<number>(51.338097);

    // --- State: مناطق پایه ---
    const [availableRegions, setAvailableRegions] = useState<Region[]>([]);

    // --- Refs ---
    const mapRef = useRef<HTMLDivElement>(null);

    // ----------------------------------------------------
    // دریافت اطلاعات اولیه
    // ----------------------------------------------------
    useEffect(() => {
        const fetchAllData = async () => {
            if (!token) return;

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            };

            try {
                // دریافت لیست مناطق + قوانین ذخیره شده از ردیس
                const [regionsRes, rulesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/regions?city_id=1`, { headers }),
                    fetch(`${API_BASE_URL}/rules`, { headers })
                ]);

                const regionsData = await regionsRes.json();
                const rulesData = await rulesRes.json();

                // ست کردن مناطق
                if (regionsData.status || regionsData.success) {
                    setAvailableRegions(regionsData.data || []);
                }

                // ست کردن اطلاعات ردیس
                if ((rulesData.status || rulesData.success) && rulesData.data) {
                    const d = rulesData.data;
                    setActiveDays(d.active_days || [6, 0, 1, 2, 3]);
                    setWorkHours(d.work_hours || { start: "08:00", end: "20:00" });
                    setCoverageDesc(d.coverage_description || "");
                    setRadius(d.coverage_radius || 8);
                    const areaIds = d.selectedAreaIds || [];
                    setSelectedAreas(Array.isArray(areaIds) ? areaIds : []);
                    setMapLat(d.map_lat || 35.699739);
                    setMapLng(d.map_lng || 51.338097);
                }

            } catch (error) {
                console.error("خطا در دریافت اطلاعات", error);
                setApiError("خطا در ارتباط با سرور برای دریافت اطلاعات اولیه.");
            } finally {
                setIsFetching(false);
            }
        };

        fetchAllData();
    }, [token]);

    // ----------------------------------------------------
    // راه‌اندازی نقشه
    // ----------------------------------------------------
    useEffect(() => {
        if (isFetching || !mapRef.current) return;

        const map = new Map({
            mapType: "neshan",
            target: mapRef.current,
            key: "web.7f11b5c6971d4917a6e9272a522d8b9e",
            poi: true,
            traffic: false,
            view: new View({
                center: fromLonLat([mapLng, mapLat]),
                zoom: 13,
            }),
        });

        map.on('moveend', () => {
            const center = map.getView().getCenter();
            if (center) {
                const lonLat = toLonLat(center);
                setMapLng(lonLat[0]);
                setMapLat(lonLat[1]);
            }
        });

        return () => map.setTarget(undefined);
    }, [isFetching]);

    // ----------------------------------------------------
    // ذخیره تمامی اطلاعات به صورت یکجا در Redis
    // ----------------------------------------------------
    const handleSaveAll = async () => {
        if (!token) return;
        setIsSaving(true);
        setShowSuccess(false);
        setApiError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/rules`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    active_days: activeDays,
                    work_hours: workHours,
                    coverage_description: coverageDesc,
                    coverage_radius: radius,
                    selectedAreaIds: selectedAreas,
                    map_lat: mapLat,
                    map_lng: mapLng
                })
            });

            const result = await response.json();

            if (result.success || result.status) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 4000);
            } else {
                setApiError(result.message || 'خطا در ذخیره‌سازی اطلاعات');
            }
        } catch (error) {
            setApiError('خطا در ارتباط با سرور هنگام ذخیره‌سازی');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleDay = (dayValue: number) => {
        setActiveDays(prev =>
            prev.includes(dayValue)
                ? prev.filter(d => d !== dayValue)
                : [...prev, dayValue].sort()
        );
    };

    const toggleArea = (areaId: number) => {
        setSelectedAreas(prev =>
            prev.includes(areaId)
                ? prev.filter(id => id !== areaId)
                : [...prev, areaId]
        );
    };

    if (isFetching) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 text-right font-[YekanBakhFaNum]" dir="rtl">
            <PageHeader
                title="قوانین خدمت رسانی"
                description="تعیین روزها و ساعات کاری به همراه محدوده پوشش‌دهی مرکز درمانی"
            />

            {apiError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {apiError}
                </div>
            )}

            {showSuccess && (
                <div className="flex animate-in fade-in slide-in-from-top-2 items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                    تنظیمات با موفقیت در سیستم ذخیره شد.
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-5 xl:col-span-4">

                    {/* تنظیمات روزها و ساعات */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-800">برنامه کاری مرکز</h2>
                                <p className="text-xs text-slate-500">روزهای فعال و ساعت خدمات‌دهی</p>
                            </div>
                        </div>

                        <div className="mb-6 space-y-3">
                            <label className="text-sm font-bold text-slate-700">روزهای فعالیت</label>
                            <div className="flex flex-wrap gap-2">
                                {WEEKDAYS.map((day) => {
                                    const isActive = activeDays.includes(day.value);
                                    return (
                                        <button
                                            key={day.value}
                                            onClick={() => toggleDay(day.value)}
                                            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all ${
                                                isActive
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                                    : 'border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                                            }`}
                                        >
                                            {isActive && <Check className="h-3.5 w-3.5" />}
                                            {day.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700">بازه زمانی فعالیت (روزانه)</label>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="time"
                                        value={workHours.start}
                                        onChange={(e) => setWorkHours({ ...workHours, start: e.target.value })}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-9 text-center text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        dir="ltr"
                                    />
                                </div>
                                <span className="text-sm font-bold text-slate-400">تا</span>
                                <div className="relative flex-1">
                                    <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="time"
                                        value={workHours.end}
                                        onChange={(e) => setWorkHours({ ...workHours, end: e.target.value })}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-9 text-center text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* فرم محدوده پوشش‌دهی */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                                <MapIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-800">محدوده تحت پوشش</h2>
                                <p className="text-xs text-slate-500">مشخصات مناطق سرویس‌دهی</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">توضیح محدوده (اختیاری)</label>
                                <input
                                    type="text"
                                    value={coverageDesc}
                                    onChange={(e) => setCoverageDesc(e.target.value)}
                                    placeholder="مثلاً: سراسر مناطق شمالی و غربی..."
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">مناطق تحت پوشش</label>
                                <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                    {availableRegions.map((region) => {
                                        const isSelected = selectedAreas.includes(region.id);
                                        return (
                                            <button
                                                key={region.id}
                                                onClick={() => toggleArea(region.id)}
                                                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                                                    isSelected
                                                        ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                                                        : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-100'
                                                }`}
                                            >
                                                {region.name}
                                            </button>
                                        );
                                    })}
                                    {availableRegions.length === 0 && (
                                        <p className="text-xs text-slate-500 w-full text-center py-2">منطقه‌ای یافت نشد.</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-slate-700">شعاع خدمت‌رسانی</label>
                                    <span className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">
                                        {radius} کیلومتر
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={30}
                                    value={radius}
                                    onChange={(e) => setRadius(Number(e.target.value))}
                                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-rose-500"
                                    dir="ltr"
                                />
                                <p className="text-xs text-slate-400">شعاع از مرکز موقعیت انتخابی روی نقشه</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:col-span-7 xl:col-span-8">
                    <div className="relative flex min-h-[400px] flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm lg:min-h-full">
                        <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-slate-900/60 to-transparent p-4">
                            <span className="text-sm font-bold text-white drop-shadow-md">
                                مرکز ثقل خدمت‌رسانی را مشخص کنید
                            </span>
                        </div>

                        <div ref={mapRef} className="absolute inset-0 h-full w-full" />

                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                            <div className="relative -top-6 transition-transform duration-200">
                                <MapPin className="h-12 w-12 text-rose-600 drop-shadow-lg" fill="currentColor" />
                                <div className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-black/20 blur-[2px]"></div>
                            </div>
                        </div>

                        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
                            <div
                                className="rounded-full border-2 border-rose-500/50 bg-rose-500/10 transition-all duration-300"
                                style={{
                                    width: `${radius * 20}px`, // ضریب نمایشی
                                    height: `${radius * 20}px`
                                }}
                            />
                        </div>

                        <div className="absolute bottom-4 left-4 z-20 rounded-xl bg-white/90 p-2 text-[10px] font-bold text-slate-600 shadow-sm backdrop-blur-sm" dir="ltr">
                            {mapLat.toFixed(5)}, {mapLng.toFixed(5)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end border-t border-slate-200 pt-6">
                <Button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="h-12 w-full rounded-2xl bg-slate-800 px-10 text-sm font-bold text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-900 sm:w-auto"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                            در حال ذخیره‌سازی...
                        </>
                    ) : (
                        "ثبت و ذخیره در سیستم"
                    )}
                </Button>
            </div>
        </div>
    );
}