import { MapPin, Phone, Truck } from 'lucide-react';
import { PageHeader, formatPrice } from '../../components';
import { mockPharmacyRequests } from '../../data/mockData';

export function PharmacyDeliveryPage() {
    const deliveries = mockPharmacyRequests.filter((r) => r.deliveryType === 'delivery');

    return (
        <div className="space-y-6">
            <PageHeader title="ارسال / تحویل" description="سفارش‌های ارسال با پیک" />

            <div className="grid gap-4">
                {deliveries.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold text-slate-800">{r.patientName}</p>
                                <p className="text-xs text-slate-500">{r.code}</p>
                            </div>
                            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                                {r.status === 'ready' ? 'آماده ارسال' : 'در جریان'}
                            </span>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <div className="flex gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                                <MapPin className="h-4 w-4 shrink-0 text-teal-600" />
                                {r.address}
                            </div>
                            <div className="flex gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                                <Phone className="h-4 w-4 text-teal-600" />
                                {r.patientPhone}
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-slate-600">مبلغ: {formatPrice(r.totalPrice)}</p>
                            <div className="flex gap-2">
                                <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white">
                                    <Truck className="h-3.5 w-3.5" />
                                    ثبت ارسال
                                </button>
                                <input
                                    placeholder="کد رهگیری"
                                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
