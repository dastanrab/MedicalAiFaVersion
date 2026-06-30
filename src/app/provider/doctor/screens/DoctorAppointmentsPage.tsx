import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Eye } from 'lucide-react';
import {
    FilterSelect,
    SearchInput,
    StatusBadge,
    PageHeader,
    EmptyState,
} from '../../components';
import {
    mockDoctorAppointments,
    doctorVisitTypeLabels,
} from '../data/mockDoctorData';
import {
    doctorAppointmentStatusLabels,
    doctorAppointmentStatusStyles,
    type DoctorAppointmentFilter,
} from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';

const filterOptions = [
    { value: 'all', label: 'همه' },
    { value: 'today', label: 'امروز' },
    { value: 'upcoming', label: 'آینده' },
    { value: 'completed', label: 'انجام شده' },
    { value: 'canceled', label: 'لغو شده' },
];

const TODAY = '1404/04/10';

function matchesFilter(
    date: string,
    status: string,
    filter: DoctorAppointmentFilter | 'all'
): boolean {
    if (filter === 'all') return true;
    if (filter === 'today') return date === TODAY;
    if (filter === 'upcoming') return date > TODAY && status !== 'canceled';
    if (filter === 'completed') return status === 'completed';
    if (filter === 'canceled') return status === 'canceled';
    return true;
}

export function DoctorAppointmentsPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<DoctorAppointmentFilter | 'all'>('all');

    const filtered = useMemo(() => {
        return mockDoctorAppointments.filter((a) => {
            if (!matchesFilter(a.date, a.status, filter)) return false;
            const q = search.trim();
            if (!q) return true;
            return a.patientName.includes(q) || a.patientPhone.includes(q);
        });
    }, [search, filter]);

    return (
        <div className="space-y-6">
            <PageHeader title="نوبت‌ها" description="مدیریت نوبت‌های ویزیت بیماران" />

            <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput value={search} onChange={setSearch} placeholder="جستجوی بیمار..." />
                <FilterSelect label="فیلتر" value={filter} onChange={(v) => setFilter(v as typeof filter)} options={filterOptions} />
            </div>

            {filtered.length === 0 ? (
                <EmptyState message="نوبتی یافت نشد." />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">بیمار</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">زمان</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">نوع ویزیت</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">وضعیت</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((a) => (
                                <tr key={a.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3">
                                        <p>{a.patientName}</p>
                                        <p className="text-xs text-slate-400" dir="ltr">{a.patientPhone}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p>{a.date}</p>
                                        <p className="text-xs text-slate-400">{a.time}</p>
                                    </td>
                                    <td className="px-4 py-3">{doctorVisitTypeLabels[a.visitType]}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge
                                            label={doctorAppointmentStatusLabels[a.status]}
                                            className={doctorAppointmentStatusStyles[a.status]}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            to={providerPath('doctor', `appointments/${a.id}`)}
                                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                        >
                                            <Eye className="h-4 w-4" />
                                            جزئیات
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
