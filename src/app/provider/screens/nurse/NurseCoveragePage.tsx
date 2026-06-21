import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { PageHeader } from '../../components';
import { mockNurseProfile } from '../../data/mockData';

const areas = [
    'نیاوران',
    'جماران',
    'ولنجک',
    'اقدسیه',
    'زعفرانیه',
    'سعادت‌آباد',
    'شهرک غرب',
];

export function NurseCoveragePage() {
    const [coverage, setCoverage] = useState(mockNurseProfile.coverage);
    const [radius, setRadius] = useState(8);
    const [selectedAreas, setSelectedAreas] = useState<string[]>(['نیاوران', 'جماران', 'ولنجک', 'اقدسیه']);

    const toggleArea = (area: string) => {
        setSelectedAreas((prev) =>
            prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
        );
    };

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
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                        <span className="text-slate-500">شعاع (کیلومتر)</span>
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
                        <div className="flex flex-wrap gap-2">
                            {areas.map((area) => (
                                <button
                                    key={area}
                                    type="button"
                                    onClick={() => toggleArea(area)}
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        selectedAreas.includes(area)
                                            ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                    {area}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="button" className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white">
                        ذخیره محدوده
                    </button>
                </div>

                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/30 p-8 text-center">
                    <MapPin className="h-12 w-12 text-rose-500" />
                    <p className="mt-4 text-sm font-medium text-slate-700">نقشه محدوده (نمایشی)</p>
                    <p className="mt-2 text-xs text-slate-500">{coverage}</p>
                    <p className="mt-4 text-xs text-rose-600">
                        {selectedAreas.length} منطقه انتخاب شده — شعاع {radius}km
                    </p>
                </div>
            </div>
        </div>
    );
}
