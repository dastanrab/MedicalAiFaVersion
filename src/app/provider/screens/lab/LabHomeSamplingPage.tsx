import { MapPin, Phone } from 'lucide-react';
import { PageHeader, StatusBadge, formatPrice } from '../../components';
import { mockLabRequests } from '../../data/mockData';
import { labStatusLabels, labStatusStyles } from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';
import { Link } from 'react-router';

export function LabHomeSamplingPage() {
    const homeRequests = mockLabRequests.filter((r) => r.type === 'home');

    return (
        <div className="space-y-6">
            <PageHeader
                title="نمونه‌گیری در منزل"
                description="درخواست‌های نمونه‌گیری در محل بیمار"
            />

            <div className="grid gap-4">
                {homeRequests.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold text-slate-800">{r.patientName}</p>
                                <p className="text-xs text-slate-500">{r.code} — {r.scheduledAt}</p>
                            </div>
                            <StatusBadge label={labStatusLabels[r.status]} className={labStatusStyles[r.status]} />
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                <span>{r.address}</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                                <Phone className="h-4 w-4 text-amber-600" />
                                <span>{r.patientPhone}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-slate-600">
                                مبلغ: {formatPrice(r.totalPrice)} — هزینه ایاب و ذهاب: {formatPrice(80000)}
                            </p>
                            <div className="flex gap-2">
                                <button type="button" className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                                    ثبت خروج
                                </button>
                                <button type="button" className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800">
                                    ثبت انجام
                                </button>
                                <Link
                                    to={providerPath('lab', `requests/${r.id}`)}
                                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-amber-600 ring-1 ring-amber-200"
                                >
                                    جزئیات
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {homeRequests.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
                        درخواست نمونه‌گیری در منزل وجود ندارد.
                    </p>
                )}
            </div>
        </div>
    );
}
