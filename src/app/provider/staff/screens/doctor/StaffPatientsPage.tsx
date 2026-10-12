import { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { EmptyState, PageHeader, SearchInput, formatFaNumber } from '../../../components';
import { useStaffDataStore } from '../../store/staffDataStore';

interface PatientContact {
    name: string;
    phone: string;
    visits: number;
    lastVisit?: string;
    nextVisit?: string;
}

/** فقط اطلاعات تماس و سابقه نوبت — پرونده پزشکی برای منشی قابل مشاهده نیست */
export function StaffPatientsPage() {
    const appointments = useStaffDataStore((s) => s.appointments);
    const [search, setSearch] = useState('');

    const patients = useMemo(() => {
        const map = new Map<string, PatientContact>();
        for (const a of appointments) {
            const p = map.get(a.patientPhone) ?? { name: a.patientName, phone: a.patientPhone, visits: 0 };
            if (a.status === 'done') {
                p.visits += 1;
                if (!p.lastVisit || a.date > p.lastVisit) p.lastVisit = a.date;
            }
            if ((a.status === 'booked' || a.status === 'checked_in') && (!p.nextVisit || a.date < p.nextVisit)) {
                p.nextVisit = a.date;
            }
            map.set(a.patientPhone, p);
        }
        const q = search.trim();
        return [...map.values()].filter((p) => !q || p.name.includes(q) || p.phone.includes(q));
    }, [appointments, search]);

    return (
        <div className="space-y-6">
            <PageHeader title="بیماران" description="اطلاعات تماس و سابقه نوبت بیماران" />

            <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>پرونده پزشکی، نسخه‌ها و نتایج هوش مصنوعی بیماران فقط برای پزشک قابل مشاهده است.</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput value={search} onChange={setSearch} placeholder="نام یا موبایل بیمار..." />
            </div>

            {patients.length === 0 ? (
                <EmptyState message="بیماری یافت نشد." />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">نام بیمار</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">موبایل</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">تعداد ویزیت</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">آخرین ویزیت</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">نوبت بعدی</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((p) => (
                                <tr key={p.phone} className="border-t border-slate-100">
                                    <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                                    <td className="px-4 py-3 text-slate-600" dir="ltr">{p.phone}</td>
                                    <td className="px-4 py-3">{formatFaNumber(p.visits)}</td>
                                    <td className="px-4 py-3 text-slate-600">{p.lastVisit ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-600">{p.nextVisit ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
