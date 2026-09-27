import { useState } from 'react';
import { NeshanLocationPicker } from '../../../components/NeshanLocationPicker';
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

                <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
                    <NeshanLocationPicker
                        lat={profile.lat}
                        lng={profile.lng}
                        onChange={(lat, lng) =>
                            setProfile((prev) => ({ ...prev, lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) }))
                        }
                        className="min-h-[320px] flex-1"
                    />
                    <p className="mt-3 text-center text-xs text-slate-500">
                        نقشه را جابه‌جا کنید تا نشانگر روی محل داروخانه قرار گیرد — {profile.lat}, {profile.lng}
                    </p>
                </div>
            </div>
        </div>
    );
}
