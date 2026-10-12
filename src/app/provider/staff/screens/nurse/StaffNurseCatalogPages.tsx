import { Lock } from 'lucide-react';
import { PageHeader, StatusBadge } from '../../../components';
import { mockStaffNursePersonnel, mockStaffNurseServices } from '../../data/mockStaffData';

const activeStyle = 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
const inactiveStyle = 'bg-slate-100 text-slate-600 ring-slate-500/20';

function ReadOnlyNote() {
    return (
        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <span>این بخش فقط خواندنی است. افزودن یا ویرایش با صاحب حساب است.</span>
        </div>
    );
}

export function StaffPersonnelPage() {
    return (
        <div className="space-y-6">
            <PageHeader title="پرسنل" description="لیست پرستاران مرکز برای هماهنگی درخواست‌ها" />
            <ReadOnlyNote />
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">نام</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">موبایل</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">جنسیت</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">وضعیت</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockStaffNursePersonnel.map((p) => (
                            <tr key={p.id} className="border-t border-slate-100">
                                <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                                <td className="px-4 py-3 text-slate-600" dir="ltr">{p.phone}</td>
                                <td className="px-4 py-3 text-slate-600">{p.gender === 'female' ? 'خانم' : 'آقا'}</td>
                                <td className="px-4 py-3">
                                    <StatusBadge label={p.active ? 'فعال' : 'غیرفعال'} className={p.active ? activeStyle : inactiveStyle} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function StaffServicesPage() {
    return (
        <div className="space-y-6">
            <PageHeader title="خدمات درمانی" description="خدمات قابل ارائه توسط مرکز" />
            <ReadOnlyNote />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {mockStaffNurseServices.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                        <div>
                            <p className="font-medium text-slate-800">{s.title}</p>
                            <p className="mt-1 text-xs text-slate-500">مدت تقریبی: {s.duration}</p>
                        </div>
                        <StatusBadge label={s.active ? 'فعال' : 'غیرفعال'} className={s.active ? activeStyle : inactiveStyle} />
                    </div>
                ))}
            </div>
        </div>
    );
}
