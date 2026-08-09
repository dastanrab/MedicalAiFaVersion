import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { PageHeader } from '../../components';
import {useProviderSession} from "../../store/providerAuthStore";
import type {ProviderRole} from "../../config/providerNav";


interface Review {
    id: number;
    patientName: string;
    comment: string;
    rating: number;
    date: string;
}
interface ProviderFinancePageProps {
    role: ProviderRole;
}
export function ProviderReviewsPage({ role }: ProviderFinancePageProps) {
    const medicalCenterSession = useProviderSession(role);

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!medicalCenterSession?.token) return;

            try {
                const response = await fetch('http://185.222.163.113:7000/api/user/provider/reviews', {
                    headers: {
                        'Authorization': `Bearer ${medicalCenterSession.token}`,
                        'Accept': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.success) {
                    const formattedReviews = result.data.map((r: any) => ({
                        id: r.id,
                        patientName: r.patientName || 'کاربر ناشناس',
                        comment: r.comment,
                        rating: r.rating,
                        date: new Date(r.date).toLocaleDateString('fa-IR')
                    }));
                    setReviews(formattedReviews);
                }
            } catch (error) {
                console.error("خطا در دریافت نظرات:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [medicalCenterSession?.token]);

    const avg = reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

    if (loading) {
        return <div className="p-6 text-center text-slate-500">در حال بارگذاری نظرات...</div>;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="نظرات و امتیاز"
                description={`میانگین امتیاز: ${avg.toFixed(1)} از ۵`}
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-center">
                    <p className="text-xs text-slate-500">میانگین امتیاز</p>
                    <p className="mt-2 flex items-center justify-center gap-1 text-3xl font-bold text-amber-700">
                        {avg.toFixed(1)}
                        <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                    </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                    <p className="text-xs text-slate-500">تعداد نظرات</p>
                    <p className="mt-2 text-3xl font-bold text-slate-800">{reviews.length}</p>
                </div>
            </div>

            <div className="space-y-3">
                {reviews.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                        نظری برای شما ثبت نشده است.
                    </div>
                ) : (
                    reviews.map((r) => (
                        <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-slate-800">{r.patientName}</p>
                                    <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
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
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
