import { useMemo } from 'react';
import { MapPin, Phone } from 'lucide-react';
import { EmptyState, PageHeader, StatusBadge } from '../../../components';
import { pharmacyStatusLabels, pharmacyStatusStyles } from '../../../config/statusOptions';
import { showProviderSuccess } from '../../../utils/toast';
import { mockStaffCouriers } from '../../data/mockStaffData';
import { useStaffDataStore } from '../../store/staffDataStore';
import { useStaffActivityLogger } from '../../store/staffStore';

/** سفارش‌های ارسال با پیک که آماده تحویل یا ارسال شده‌اند */
export function StaffDeliveryPage() {
    const log = useStaffActivityLogger('pharmacy');
    const requests = useStaffDataStore((s) => s.pharmacyRequests);
    const updatePharmacyRequest = useStaffDataStore((s) => s.updatePharmacyRequest);

    const list = useMemo(
        () => requests.filter((r) => r.deliveryType === 'courier' && (r.status === 'ready' || r.status === 'delivered')),
        [requests]
    );

    return (
        <div className="space-y-6">
            <PageHeader title="ارسال / تحویل" description="تعیین پیک و ثبت تحویل سفارش‌های ارسالی" />

            {list.length === 0 ? (
                <EmptyState message="سفارشی آماده ارسال نیست." />
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    {list.map((r) => (
                        <div key={r.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-slate-800">{r.patientName}</p>
                                    <p className="font-mono text-xs text-slate-400">{r.code}</p>
                                </div>
                                <StatusBadge label={pharmacyStatusLabels[r.status]} className={pharmacyStatusStyles[r.status]} />
                            </div>
                            <p className="flex items-start gap-1.5 text-sm text-slate-600">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                {r.address}
                            </p>
                            <p className="flex items-center gap-1.5 text-sm text-slate-600" dir="ltr">
                                <Phone className="h-4 w-4 text-slate-400" />
                                {r.patientPhone}
                            </p>

                            {r.status === 'ready' ? (
                                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                                    <select
                                        value={r.courierName ?? ''}
                                        onChange={(e) => {
                                            updatePharmacyRequest(r.id, { courierName: e.target.value || undefined });
                                            if (e.target.value) log('تعیین پیک', `${r.code} — ${e.target.value}`);
                                        }}
                                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                                    >
                                        <option value="">انتخاب پیک</option>
                                        {mockStaffCouriers.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        disabled={!r.courierName}
                                        onClick={() => {
                                            updatePharmacyRequest(r.id, { status: 'delivered' });
                                            log('ثبت تحویل سفارش', `${r.code} — ${r.patientName}`);
                                            showProviderSuccess('تحویل سفارش ثبت شد');
                                        }}
                                        className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        تحویل داده شد
                                    </button>
                                </div>
                            ) : (
                                <p className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                                    ارسال توسط: {r.courierName ?? '—'}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
