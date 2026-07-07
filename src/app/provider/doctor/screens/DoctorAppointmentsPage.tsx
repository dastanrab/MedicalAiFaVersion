import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Eye, Loader2 } from 'lucide-react';
import {
    FilterSelect,
    SearchInput,
    StatusBadge,
    PageHeader,
    EmptyState,
} from '../../components';
import {
    doctorAppointmentStatusLabels,
    doctorAppointmentStatusStyles,
    type DoctorAppointmentFilter,
} from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';
import {useDoctorAuthStore} from "../store/doctorAuthStore";


const API_BASE_URL = 'http://185.222.163.113:7000/api';

const filterOptions = [
    { value: 'all', label: 'همه' },
    { value: 'booked', label: 'رزرو شده' },
    { value: 'done', label: 'انجام شده' },
];

interface ApiAppointment {
    id: number;
    name: string;
    phone: string;
    status: 'available' | 'booked' | 'blocked' | 'done';
    slot_date: string;
    start_time: string;
}

interface Appointment {
    id: number;
    patientName: string;
    patientPhone: string;
    status: 'available' | 'booked' | 'blocked' | 'done';
    date: string;
    time: string;
}

export function DoctorAppointmentsPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'booked' | 'done'>('all');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const { token } = useDoctorAuthStore();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/doctor/appointments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('خطا در دریافت نوبت‌ها');
            }

            const result = await response.json();

            if (result.status && result.data) {
                const mapped: Appointment[] = result.data.map((a: ApiAppointment) => ({
                    id: a.id,
                    patientName: a.name,
                    patientPhone: a.phone,
                    status: a.status,
                    date: a.slot_date,
                    time: a.start_time,
                }));
                setAppointments(mapped);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات');
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return appointments.filter((a) => {
            if (filter !== 'all' && a.status !== filter) return false;
            const q = search.trim();
            if (!q) return true;
            return a.patientName.includes(q) || a.patientPhone.includes(q);
        });
    }, [appointments, search, filter]);

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <PageHeader title="نوبت‌ها" description="مدیریت نوبت‌های ویزیت بیماران" />
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-red-600">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader title="نوبت‌ها" description="مدیریت نوبت‌های ویزیت بیماران" />

            <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput value={search} onChange={setSearch} placeholder="جستجوی بیمار..." />
                <FilterSelect
                    label="فیلتر"
                    value={filter}
                    onChange={(v) => setFilter(v as typeof filter)}
                    options={filterOptions}
                />
            </div>

            {filtered.length === 0 ? (
                <EmptyState message="نوبتی یافت نشد." />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">بیمار</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">تاریخ</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">ساعت</th>
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
                                <td className="px-4 py-3">{a.date}</td>
                                <td className="px-4 py-3">{a.time}</td>
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
