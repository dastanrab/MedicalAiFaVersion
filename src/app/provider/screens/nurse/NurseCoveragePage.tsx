import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { PageHeader } from '../../components';
import { Spinner } from '../../../components/PageLoader';
import {useProviderSession} from "../../store/providerAuthStore";


// تعریف تایپ برای مناطق درایفتی از سرور
interface Region {
    id: number;
    name: string;
}

export default function NurseCoveragePage() {
    const { token } = useProviderSession('nurse');

    // استیت‌های مقادیر فرم
    const [coverage, setCoverage] = useState('');
    const [radius, setRadius] = useState(8); // فعلا فقط نمایشی
    const [selectedAreas, setSelectedAreas] = useState<number[]>([]); // ذخیره بر اساس ID منطقه

    // استیت‌های دیتای پایه و وضعیت‌ها
    const [availableRegions, setAvailableRegions] = useState<Region[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const BASE_URL = 'http://185.222.163.113:7000/api/owner/medical-center/coverage';

    // دریافت اطلاعات اولیه (تنظیمات فعلی + لیست مناطق)
    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. ابتدا لیست مناطق
                const regionsRes = await fetch(`${BASE_URL}/regions?city_id=1`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                const regionsData = await regionsRes.json();
                if (regionsData.status) {
                    setAvailableRegions(regionsData.data);
                }

                // 2. سپس تنظیمات فعلی
                const coverageRes = await fetch(BASE_URL, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                const coverageData = await coverageRes.json();

                if (coverageData.status && coverageData.data) {
                    setCoverage(coverageData.data.coverage_description || '');

                    // این خط مهم است - باید آرایه‌ای از اعداد باشد
                    const areaIds = coverageData.data.selectedAreaIds || [];
                    console.log('araes',areaIds)
                    setSelectedAreas(Array.isArray(areaIds) ? areaIds : []);
                }
            } catch (error) {
                console.error("خطا در دریافت اطلاعات:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const toggleArea = (id: number) => {
        setSelectedAreas((prev) =>
            prev.includes(id) ? prev.filter((areaId) => areaId !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    coverage_description: coverage,
                    selectedAreaIds: selectedAreas
                    // شعاع در اینجا ارسال نمی‌شود (طبق درخواست شما، فعلا نمایشی است)
                })
            });

            const result = await response.json();
            if (result.success) {
                alert('تنظیمات با موفقیت ذخیره شد.');
            } else {
                alert(result.message || 'خطا در ذخیره‌سازی');
            }
        } catch (error) {
            console.error("خطا در ذخیره اطلاعات:", error);
            alert('خطا در ارتباط با سرور');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader title="محدوده خدمت‌رسانی" description="مناطق تحت پوشش و شعاع خدمت" />

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
                    <label className="flex flex-col gap-1 text-sm">
                        <span className="text-slate-500">توضیح محدوده</span>
                        <input
                            value={coverage}
                            onChange={(e) => setCoverage(e.target.value)}
                            className="rounded-xl border border-slate-200 px-3 py-2"
                            placeholder="مثلا: سراسر مناطق شمال تهران"
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                        <span className="text-slate-500">شعاع (کیلومتر) - فقط نمایشی</span>
                        <input
                            type="range"
                            min={3}
                            max={20}
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                            className="w-full"
                        />
                        <span className="text-xs text-slate-400">{radius} کیلومتر از موقعیت فعلی</span>
                    </label>

                    <div>
                        <p className="mb-2 text-sm font-medium text-slate-700">انتخاب مناطق</p>
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50">
                            {availableRegions.map((region) => (
                                <button
                                    key={region.id}
                                    type="button"
                                    onClick={() => toggleArea(region.id)}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                        selectedAreas.includes(region.id)
                                            ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                                            : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    {region.name}
                                </button>
                            ))}
                            {availableRegions.length === 0 && (
                                <span className="text-xs text-slate-500">منطقه‌ای یافت نشد.</span>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors ${
                            isSaving ? 'bg-rose-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                    >
                        {isSaving ? 'در حال ذخیره...' : 'ذخیره محدوده'}
                    </button>
                </div>

                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/30 p-8 text-center">
                    <MapPin className="h-12 w-12 text-rose-500" />
                    <p className="mt-4 text-sm font-medium text-slate-700">نقشه محدوده (نمایشی)</p>
                    <p className="mt-2 text-xs text-slate-500">{coverage || 'بدون توضیحات'}</p>
                    <p className="mt-4 text-xs text-rose-600">
                        {selectedAreas.length} منطقه انتخاب شده — شعاع {radius}km
                    </p>
                </div>
            </div>
        </div>
    );
}
