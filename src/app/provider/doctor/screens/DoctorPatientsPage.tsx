import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Eye, FolderOpen } from 'lucide-react';
import { SearchInput, PageHeader, EmptyState } from '../../components';
import { mockDoctorPatients } from '../data/mockDoctorData';
import { providerPath } from '../../config/providerNav';

export function DoctorPatientsPage() {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.trim();
        if (!q) return mockDoctorPatients;
        return mockDoctorPatients.filter(
            (p) => p.name.includes(q) || p.phone.includes(q) || p.nationalId.includes(q)
        );
    }, [search]);

    return (
        <div className="space-y-6">
            <PageHeader title="بیماران" description="لیست بیماران و پرونده‌های پزشکی" />

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput value={search} onChange={setSearch} placeholder="جستجوی نام، موبایل یا کد ملی..." />
            </div>

            {filtered.length === 0 ? (
                <EmptyState message="بیماری یافت نشد." />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">نام</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">آخرین مراجعه</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">تعداد ویزیت</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">پرونده</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => (
                                <tr key={p.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{p.name}</p>
                                        <p className="text-xs text-slate-400" dir="ltr">{p.phone}</p>
                                    </td>
                                    <td className="px-4 py-3">{p.lastVisit}</td>
                                    <td className="px-4 py-3">{p.visitCount.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 text-blue-600">
                                            <FolderOpen className="h-4 w-4" />
                                            پرونده
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            to={providerPath('doctor', `patients/${p.id}`)}
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
