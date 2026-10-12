import { Star } from 'lucide-react';
import { PageHeader, formatFaNumber } from '../../components';
import { mockStaffReviews } from '../data/mockStaffData';

/** نظرات کاربران — فقط خواندنی */
export function StaffReviewsPage() {
    const avg = mockStaffReviews.reduce((sum, r) => sum + r.rating, 0) / (mockStaffReviews.length || 1);

    return (
        <div className="space-y-6">
            <PageHeader title="نظرات و امتیاز" description="بازخورد بیماران از خدمات مرکز" />

            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-3xl font-bold text-slate-800">{formatFaNumber(avg.toFixed(1))}</div>
                <div>
                    <Stars rating={Math.round(avg)} />
                    <p className="mt-1 text-xs text-slate-500">از {formatFaNumber(mockStaffReviews.length)} نظر</p>
                </div>
            </div>

            <div className="space-y-3">
                {mockStaffReviews.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <p className="font-medium text-slate-800">{r.author}</p>
                            <span className="text-xs text-slate-400">{r.date}</span>
                        </div>
                        <Stars rating={r.rating} />
                        <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Stars({ rating }: { rating: number }) {
    return (
        <div className="mt-1 flex gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                />
            ))}
        </div>
    );
}
