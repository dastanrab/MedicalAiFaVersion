import { useState } from 'react';
import { Star } from 'lucide-react';
import { PageHeader } from '../../components';
import { mockDoctorProfile, mockDoctorReviews } from '../data/mockDoctorData';

export function DoctorReviewsPage() {
    const [reviews, setReviews] = useState(mockDoctorReviews);
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

    const reply = (id: number) => {
        const text = window.prompt('متن پاسخ:');
        if (!text) return;
        // TODO: ارسال پاسخ به API
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, replied: text } : r)));
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="نظرات و امتیاز"
                description={`امتیاز پزشک: ${mockDoctorProfile.rating.toLocaleString('fa-IR')} — میانگین نظرات: ${avg.toFixed(1)}`}
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-center">
                    <p className="text-xs text-slate-500">امتیاز پزشک</p>
                    <p className="mt-2 flex items-center justify-center gap-1 text-3xl font-bold text-blue-700">
                        {mockDoctorProfile.rating.toLocaleString('fa-IR')}
                        <Star className="h-6 w-6 fill-blue-400 text-blue-400" />
                    </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                    <p className="text-xs text-slate-500">تعداد نظرات</p>
                    <p className="mt-2 text-3xl font-bold text-slate-800">{reviews.length}</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-center">
                    <p className="text-xs text-slate-500">پاسخ داده شده</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-700">
                        {reviews.filter((r) => r.replied).length}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {reviews.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold text-slate-800">{r.patientName}</p>
                                <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
                                {r.replied && (
                                    <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
                                        پاسخ شما: {r.replied}
                                    </p>
                                )}
                            </div>
                            <div className="text-left">
                                <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                                        />
                                    ))}
                                </div>
                                <p className="mt-1 text-xs text-slate-400">{r.date}</p>
                            </div>
                        </div>
                        {!r.replied && (
                            <button
                                type="button"
                                onClick={() => reply(r.id)}
                                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                پاسخ به نظر
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
