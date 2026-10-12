import { Lock } from 'lucide-react';
import { PageHeader, formatFaNumber } from '../../../components';
import { mockStaffSchedule } from '../../data/mockStaffData';

/** برنامه زمانی مطب — فقط خواندنی؛ تغییر ساعت‌ها با پزشک است */
export function StaffSchedulePage() {
    return (
        <div className="space-y-6">
            <PageHeader title="برنامه زمانی" description="ساعات کاری هفتگی مطب" />

            <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                <span>این بخش فقط خواندنی است. برای تغییر ساعات کاری با پزشک هماهنگ کنید.</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {mockStaffSchedule.map((day) => (
                    <div key={day.weekday} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="font-semibold text-slate-800">{day.weekday}</p>
                            {day.shifts.length > 0 && (
                                <span className="text-xs text-slate-400">
                                    هر نوبت {formatFaNumber(day.slotMinutes)} دقیقه
                                </span>
                            )}
                        </div>
                        {day.shifts.length === 0 ? (
                            <p className="text-sm text-slate-400">تعطیل</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {day.shifts.map((s) => (
                                    <span
                                        key={s.start}
                                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-700"
                                        dir="ltr"
                                    >
                                        {s.start} – {s.end}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
