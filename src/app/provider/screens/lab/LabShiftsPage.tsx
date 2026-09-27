import { useEffect, useRef, useState } from "react";
import {
    CalendarDays, Clock, Check, Loader2, CheckCircle2,
    Sun, Sunset, Moon, Users, SlidersHorizontal,
    Sparkles, MapPin, Map as MapIcon, Info
} from "lucide-react";

import { PageHeader } from "../../components";
import { useProviderSession } from "../../store/providerAuthStore";
import { Button } from "../../../components/ui/button";

import Map from "@neshan-maps-platform/ol/Map";
import View from "@neshan-maps-platform/ol/View";
import { fromLonLat, toLonLat } from "@neshan-maps-platform/ol/proj";
import { NESHAN_MAP_KEY } from "../../../config/neshan";
import { NeshanLocateButton } from "../../../components/NeshanLocateButton";

const API_BASE_URL = 'https://api.mediraai.com/api/owner/lab/rules';

const WEEKDAYS = [
    { label: 'شنبه', value: 6 }, { label: 'یکشنبه', value: 0 },
    { label: 'دوشنبه', value: 1 }, { label: 'سه‌شنبه', value: 2 },
    { label: 'چهارشنبه', value: 3 }, { label: 'پنج‌شنبه', value: 4 },
    { label: 'جمعه', value: 5 },
];

const SHIFT_DEFINITIONS = [
    { id: 1, title: "شیفت صبح", hint: "ناشتا و روتین", icon: Sun, theme: { activeBorder: "border-amber-400 bg-amber-50/40", iconBg: "bg-amber-500 text-white shadow-amber-200", badge: "bg-amber-100 text-amber-800" } },
    { id: 2, title: "شیفت عصر", hint: "غیرناشتا و چکاپ", icon: Sunset, theme: { activeBorder: "border-orange-400 bg-orange-50/40", iconBg: "bg-orange-500 text-white shadow-orange-200", badge: "bg-orange-100 text-orange-800" } },
    { id: 3, title: "شیفت شب", hint: "اورژانسی", icon: Moon, theme: { activeBorder: "border-indigo-400 bg-indigo-50/40", iconBg: "bg-indigo-600 text-white shadow-indigo-200", badge: "bg-indigo-100 text-indigo-800" } }
];

interface ShiftConfig { isActive: boolean; start: string; end: string; capacity: number; }
interface Region { id: number; name: string; }

export default function LabShiftsPage() {
    const { token } = useProviderSession('lab');
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);

    // --- State: وضعیت‌ها ---
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // --- State: شیفت‌ها و روزها ---
    const [activeDays, setActiveDays] = useState<number[]>([6, 0, 1, 2, 3, 4]);
    const [shifts, setShifts] = useState<{ [key: number]: ShiftConfig }>({
        1: { isActive: true, start: "07:30", end: "12:00", capacity: 25 },
        2: { isActive: true, start: "12:00", end: "18:00", capacity: 20 },
        3: { isActive: false, start: "18:00", end: "22:00", capacity: 10 }
    });

    // --- State: نقشه و محدوده ---
    const [coverageDesc, setCoverageDesc] = useState("");
    const [radius, setRadius] = useState(8);
    const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
    const [mapLat, setMapLat] = useState<number>(35.699739);
    const [mapLng, setMapLng] = useState<number>(51.338097);
    const [availableRegions, setAvailableRegions] = useState<Region[]>([]);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!token) return;
            const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

            try {
                const [regionsRes, rulesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/regions?city_id=1`, { headers }),
                    fetch(`${API_BASE_URL}/get`, { headers })
                ]);

                const regionsData = await regionsRes.json();
                const rulesData = await rulesRes.json();

                if (regionsData.status || regionsData.success) {
                    setAvailableRegions(regionsData.data || []);
                }

                if ((rulesData.status || rulesData.success) && rulesData.data) {
                    const d = rulesData.data;
                    setActiveDays(d.active_days || [6, 0, 1, 2, 3, 4]);
                    if (d.shifts) setShifts(prev => ({ ...prev, ...d.shifts }));
                    setCoverageDesc(d.coverage_description || "");
                    setRadius(d.coverage_radius || 8);
                    setSelectedAreas(Array.isArray(d.selectedAreaIds) ? d.selectedAreaIds : []);
                    setMapLat(d.map_lat || 35.699739);
                    setMapLng(d.map_lng || 51.338097);
                }
            } catch (error) {
                setApiError("خطا در برقراری ارتباط با سرور برای دریافت اطلاعات.");
            } finally {
                setIsFetching(false);
            }
        };

        fetchAllData();
    }, [token]);

    useEffect(() => {
        if (isFetching || !mapRef.current) return;

        const map = new Map({
            mapType: "neshan",
            target: mapRef.current,
            key: NESHAN_MAP_KEY,
            poi: true,
            traffic: false,
            view: new View({ center: fromLonLat([mapLng, mapLat]), zoom: 13 }),
        });

        mapInstanceRef.current = map;


        map.on('moveend', () => {
            const center = map.getView().getCenter();
            if (center) {
                const lonLat = toLonLat(center);
                setMapLng(lonLat[0]);
                setMapLat(lonLat[1]);
            }
        });

        return () => {
            map.setTarget(undefined);
            mapInstanceRef.current = null;
        };
    }, [isFetching]);

    const handleSaveRules = async () => {
        if (!token) return;
        setIsSaving(true);
        setShowSuccess(false);
        setApiError(null);

        const activeShiftsCount = Object.values(shifts).filter(s => s.isActive).length;
        if (activeShiftsCount === 0) {
            setApiError("حداقل باید یک شیفت کاری فعال در سیستم تنظیم شده باشد.");
            setIsSaving(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/save`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    active_days: activeDays,
                    shifts: shifts,
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
                setApiError(result.message || 'خطا در ثبت اطلاعات');
            }
        } catch {
            setApiError('خطا در ارتباط با سرور هنگام ذخیره‌سازی.');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleDay = (dayValue: number) => {
        setActiveDays(prev => prev.includes(dayValue) ? prev.filter(d => d !== dayValue) : [...prev, dayValue].sort());
    };

    const toggleArea = (areaId: number) => {
        setSelectedAreas(prev => prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]);
    };

    const updateShiftField = (shiftId: number, field: keyof ShiftConfig, value: any) => {
        setShifts(prev => ({ ...prev, [shiftId]: { ...prev[shiftId], [field]: value } }));
    };

    const totalActiveCapacity = Object.values(shifts).filter(s => s.isActive).reduce((sum, item) => sum + (Number(item.capacity) || 0), 0);

    if (isFetching) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;

    return (
        <div className="space-y-6 text-right font-[YekanBakhFaNum] pb-10" dir="rtl">
            <PageHeader title="قوانین، شیفت‌ها و محدوده خدمت‌رسانی" description="مدیریت جامع نوبت‌دهی، زمان‌بندی و موقعیت جغرافیایی آزمایشگاه روی نقشه" />

            {apiError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{apiError}</div>}
            {showSuccess && <div className="flex animate-in fade-in slide-in-from-top-2 items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-5 w-5" /> تنظیمات با موفقیت در سیستم ثبت شد.</div>}

            {/* ۱. بخش انتخاب روزهای کاری */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-2.5 border-b border-slate-100 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><CalendarDays className="h-5 w-5" /></div>
                    <div>
                        <h2 className="text-base font-bold text-slate-800">روزهای فعالیت</h2>
                        <p className="text-xs text-slate-500">روزهایی که آزمایشگاه برای نمونه‌گیری فعال است</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                    {WEEKDAYS.map((day) => (
                        <button key={day.value} type="button" onClick={() => toggleDay(day.value)} className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${activeDays.includes(day.value) ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                            {activeDays.includes(day.value) && <Check className="h-3.5 w-3.5" />} {day.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ۲. بخش تنظیمات شیفت‌ها (ساعت، وضعیت و ظرفیت) */}
            <div className="mt-6">
                <div className="flex items-center justify-between px-1 mb-4">
                    <div className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-blue-600" /><h2 className="text-base font-bold text-slate-800">شیفت‌های کاری و ظرفیت پذیرش</h2></div>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-500"><Sparkles className="h-4 w-4 text-amber-500" /><span>کل ظرفیت روزانه:</span><span className="font-black text-blue-600">{totalActiveCapacity.toLocaleString("fa-IR")}</span><span>نوبت</span></div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {SHIFT_DEFINITIONS.map((def) => {
                        const data = shifts[def.id];
                        const Icon = def.icon;
                        return (
                            <div key={def.id} className={`flex flex-col justify-between rounded-3xl border-2 p-5 shadow-sm transition-all ${data.isActive ? `${def.theme.activeBorder} bg-white ring-1 ring-black/5` : 'border-slate-200 bg-slate-50/70 opacity-60'}`}>
                                <div>
                                    {/* هدر کارت شیفت + کلید فعال/غیرفعال */}
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${def.theme.iconBg}`}><Icon className="h-4 w-4" /></div>
                                            <div><h3 className="text-sm font-bold text-slate-800">{def.title}</h3><span className="text-[10px] text-slate-500">{def.hint}</span></div>
                                        </div>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input type="checkbox" className="peer sr-only" checked={data.isActive} onChange={(e) => updateShiftField(def.id, 'isActive', e.target.checked)} />
                                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full"></div>
                                        </label>
                                    </div>

                                    {/* ورودی بازه زمانی و ظرفیت */}
                                    <div className="mt-5 space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-500">از ساعت</label>
                                                <div className="relative">
                                                    <Clock className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                                    <input type="time" disabled={!data.isActive} value={data.start} onChange={(e) => updateShiftField(def.id, 'start', e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-2 pr-7 text-center text-xs font-bold text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400" dir="ltr" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-500">تا ساعت</label>
                                                <div className="relative">
                                                    <Clock className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                                    <input type="time" disabled={!data.isActive} value={data.end} onChange={(e) => updateShiftField(def.id, 'end', e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-2 pr-7 text-center text-xs font-bold text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400" dir="ltr" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500">ظرفیت پذیرش (تعداد نوبت)</label>
                                            <div className="relative">
                                                <Users className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                                <input type="number" min="0" disabled={!data.isActive} value={data.capacity} onChange={(e) => updateShiftField(def.id, 'capacity', Number(e.target.value) || 0)} className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-center text-xs font-bold text-slate-800 outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400" dir="ltr" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* نمایش وضعیت شیفت */}
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold ${data.isActive ? def.theme.badge : "bg-slate-100 text-slate-400"}`}>
                                        {data.isActive ? <><CheckCircle2 className="h-3.5 w-3.5" /> شیفت فعال است</> : <><Info className="h-3.5 w-3.5" /> شیفت غیرفعال است</>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ۳. بخش نقشه و شعاع خدمت رسانی */}
            <div className="grid gap-6 lg:grid-cols-12 mt-6">
                <div className="space-y-6 lg:col-span-5">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><MapIcon className="h-5 w-5" /></div>
                            <div><h2 className="text-base font-bold text-slate-800">محدوده تحت پوشش</h2></div>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">توضیح محدوده (اختیاری)</label>
                                <input type="text" value={coverageDesc} onChange={(e) => setCoverageDesc(e.target.value)} placeholder="مثلاً: فقط مناطق شمالی" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">مناطق انتخابی</label>
                                <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                    {availableRegions.map((region) => (
                                        <button key={region.id} onClick={() => toggleArea(region.id)} className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${selectedAreas.includes(region.id) ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-100'}`}>
                                            {region.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between"><label className="text-sm font-bold text-slate-700">شعاع (کیلومتر)</label><span className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">{radius}</span></div>
                                <input type="range" min={1} max={30} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-rose-500" dir="ltr" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <div className="relative flex h-[350px] w-full flex-col overflow-hidden rounded-3xl border border-slate-200 shadow-sm lg:h-full">
                        <div className="absolute left-0 right-0 top-0 z-20 flex bg-gradient-to-b from-slate-900/60 to-transparent p-4"><span className="text-sm font-bold text-white drop-shadow-md">مرکز ثقل آزمایشگاه روی نقشه</span></div>
                        <div ref={mapRef} className="absolute inset-0 h-full w-full" />
                        <NeshanLocateButton mapRef={mapInstanceRef} className="bottom-4 right-4" />
                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                            <div className="relative -top-6"><MapPin className="h-12 w-12 text-rose-600 drop-shadow-lg" fill="currentColor" /></div>
                        </div>
                        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
                            <div className="rounded-full border-2 border-rose-500/50 bg-rose-500/10 transition-all duration-300" style={{ width: `${radius * 20}px`, height: `${radius * 20}px` }} />
                        </div>
                        <div className="absolute bottom-4 left-4 z-20 rounded-xl bg-white/90 p-2 text-[10px] font-bold text-slate-600 shadow-sm backdrop-blur-sm" dir="ltr">{mapLat.toFixed(5)}, {mapLng.toFixed(5)}</div>
                    </div>
                </div>
            </div>

            {/* نوار پایین فرم */}
            <div className="flex justify-end pt-6">
                <Button onClick={handleSaveRules} disabled={isSaving} className="h-12 w-full rounded-2xl bg-blue-600 px-10 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 sm:w-auto">
                    {isSaving ? <><Loader2 className="ml-2 h-5 w-5 animate-spin" />درحال ذخیره...</> : "ثبت تنظیمات سیستم"}
                </Button>
            </div>
        </div>
    );
}