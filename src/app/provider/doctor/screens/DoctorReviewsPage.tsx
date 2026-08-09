import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { PageHeader } from '../../components';
import { mockDoctorProfile } from '../data/mockDoctorData';
import {useDoctorAuthStore} from "../store/doctorAuthStore";
// فرض می‌کنیم store شما در چنین مسیری قرار دارد


export function DoctorReviewsPage() {
    // می‌توانید مقدار اولیه را یک آرایه خالی بدهید، اینجا فعلاً برای جلوگیری از خطا ساختار حفظ شده است
    const [reviews, setReviews] = useState<any[]>([]);
    const { token } = useDoctorAuthStore();

    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    // دریافت لیست نظرات از API هنگام لود صفحه
    // دریافت لیست نظرات از API هنگام لود صفحه
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch('http://185.222.163.113:7000/api/user/provider/reviews', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();

                    // بررسی اینکه آیا داده مستقیماً آرایه است یا داخل فیلد data قرار دارد
                    const reviewsArray = Array.isArray(data) ? data : (data.data || []);
                    setReviews(reviewsArray);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
                setReviews([]); // در صورت خطا، آرایه خالی ست شود تا صفحه کرش نکند
            }
        };

        if (token) {
            fetchReviews();
        }
    }, [token]);


    const reply = async (id: number) => {
        const text = window.prompt('متن پاسخ:');
        if (!text) return;

        try {
            // ارسال پاسخ به API
            const response = await fetch(`/api/doctor/reviews/${id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ reply: text })
            });

            if (response.ok) {
                // آپدیت UI در صورت موفقیت
                setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, replied: text } : r)));
            } else {
                alert('خطا در ثبت پاسخ');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('خطا در ارتباط با سرور');
        }
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
