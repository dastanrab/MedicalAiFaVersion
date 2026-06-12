import { BarChart3, TrendingUp, Users, CalendarCheck, CreditCard } from 'lucide-react';

const stats = [
    { label: 'کاربران فعال', value: '۱,۲۴۸', change: '+۱۲٪', icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'نوبت‌های ماه', value: '۳۴۶', change: '+۸٪', icon: CalendarCheck, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'درآمد ماه', value: '۴۲.۵M', change: '+۱۵٪', icon: CreditCard, color: 'text-violet-600 bg-violet-50' },
    { label: 'رشد کلی', value: '۲۳٪', change: 'ماه جاری', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
];

export function AdminReports() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800">گزارش‌ها</h2>
                <p className="mt-1 text-sm text-slate-500">خلاصه عملکرد سامانه</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium text-emerald-600">{stat.change}</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700">نمودارهای تفصیلی</h3>
                <p className="mt-2 text-sm text-slate-500">
                    گزارش‌های پیشرفته (نمودار درآمد، نوبت‌ها، کاربران) پس از اتصال API کامل
                    در دسترس خواهد بود.
                </p>
            </div>
        </div>
    );
}
