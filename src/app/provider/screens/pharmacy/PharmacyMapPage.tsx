import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { PageHeader } from '../../components';
import { mockPharmacyProfile } from '../../data/mockData';

export function PharmacyMapPage() {
    const [profile, setProfile] = useState(mockPharmacyProfile);

    return (
        <div className="space-y-6">
            <PageHeader title="موقعیت روی نقشه" description="ثبت GPS و وضعیت باز / بسته" />

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="grid gap-4">
                        <label className="flex flex-col gap-1 text-sm">
                            <span className="text-slate-500">عرض جغرافیایی</span>
                            <input
                                value={profile.lat}
                                onChange={(e) => setProfile({ ...profile, lat: Number(e.target.value) })}
                                className="rounded-xl border border-slate-200 px-3 py-2"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                            <span className="text-slate-500">طول جغرافیایی</span>
                            <input
                                value={profile.lng}
                                onChange={(e) => setProfile({ ...profile, lng: Number(e.target.value) })}
                                className="rounded-xl border border-slate-200 px-3 py-2"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                            <span className="text-slate-500">آدرس</span>
                            <textarea
                                value={profile.address}
                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                rows={3}
                                className="rounded-xl border border-slate-200 px-3 py-2"
                            />
                        </label>
                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={profile.isOpen}
                                    onChange={(e) => setProfile({ ...profile, isOpen: e.target.checked })}
                                />
                                باز
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" defaultChecked={profile.shift === 'day'} />
                                شبانه‌روزی
                            </label>
                        </div>
                        <button type="button" className="rounded-xl bg-teal-600 py-2.5 text-sm font-medium text-white">
                            ذخیره موقعیت
                        </button>
                    </div>
                </div>

                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-teal-200 bg-teal-50/30 p-8 text-center">
                    <MapPin className="h-12 w-12 text-teal-500" />
                    <p className="mt-4 text-sm font-medium text-slate-700">پیش‌نمایش نقشه (نمایشی)</p>
                    <p className="mt-2 text-xs text-slate-500">
                        {profile.lat}, {profile.lng}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{profile.address}</p>
                </div>
            </div>
        </div>
    );
}
