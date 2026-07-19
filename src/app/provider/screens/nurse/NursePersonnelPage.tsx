import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, X } from 'lucide-react';
import { PageHeader, EmptyState } from '../../components';
import { Spinner } from '../../../components/PageLoader';
import { AddPersonnelModal } from '../../components/AddPersonnelModal';
import {
    createNursePersonnel,
    fetchNursePersonnel,
    updateNursePersonnel,
} from '../../services/nurseApi';
import type { NursePersonnel } from '../../data/mockData';

const filterInputClass =
    'w-full rounded-[0.5rem] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400';

type GenderFilter = 'all' | 'male' | 'female';

const genderOptions: { value: GenderFilter; label: string }[] = [
    { value: 'all', label: 'همه' },
    { value: 'male', label: 'مرد' },
    { value: 'female', label: 'زن' },
];

function genderLabel(gender: NursePersonnel['gender']) {
    return gender === 'male' ? 'مرد' : 'زن';
}

export function NursePersonnelPage() {
    const [items, setItems] = useState<NursePersonnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<NursePersonnel | null>(null);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nationalCode, setNationalCode] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState<GenderFilter>('all');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setItems(await fetchNursePersonnel());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const hasActiveFilters =
        firstName.trim() !== '' ||
        lastName.trim() !== '' ||
        nationalCode.trim() !== '' ||
        phone.trim() !== '' ||
        gender !== 'all';

    const clearFilters = () => {
        setFirstName('');
        setLastName('');
        setNationalCode('');
        setPhone('');
        setGender('all');
    };

    const filtered = useMemo(() => {
        const fn = firstName.trim();
        const ln = lastName.trim();
        const nc = nationalCode.trim().replace(/\D/g, '');
        const ph = phone.trim().replace(/\D/g, '');

        return items.filter((p) => {
            if (fn && !p.firstName.includes(fn)) return false;
            if (ln && !p.lastName.includes(ln)) return false;
            if (nc && !p.nationalCode.replace(/\D/g, '').includes(nc)) return false;
            if (ph && !p.phone.replace(/\D/g, '').includes(ph)) return false;
            if (gender !== 'all' && p.gender !== gender) return false;
            return true;
        });
    }, [items, firstName, lastName, nationalCode, phone, gender]);

    const openAdd = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (item: NursePersonnel) => {
        setEditing(item);
        setModalOpen(true);
    };

    const handleSubmit = async (input: Parameters<typeof createNursePersonnel>[0]) => {
        if (editing) {
            await updateNursePersonnel(editing.id, input);
        } else {
            await createNursePersonnel(input);
        }
        await load();
        setModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="پرسنل"
                description="مدیریت پرسنل شرکت خدمات پرستاری"
                actions={
                    <button
                        type="button"
                        onClick={openAdd}
                        className="group inline-flex items-center gap-2.5 rounded-[0.5rem] bg-gradient-to-l from-rose-700 via-rose-600 to-rose-500 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-rose-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-600/35 active:translate-y-0 active:shadow-md"
                    >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 transition-colors group-hover:bg-white/30">
                            <Plus className="h-4 w-4" strokeWidth={2.5} />
                        </span>
                        افزودن پرسنل
                    </button>
                }
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-700">جستجو و فیلتر</p>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600"
                        >
                            <X className="h-3.5 w-3.5" />
                            پاک کردن فیلترها
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500">نام</label>
                        <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={filterInputClass}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500">نام خانوادگی</label>
                        <input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={filterInputClass}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500">کد ملی</label>
                        <input
                            value={nationalCode}
                            onChange={(e) => setNationalCode(e.target.value)}
                            className={`${filterInputClass} dir-ltr text-left`}
                            dir="ltr"
                            inputMode="numeric"
                            maxLength={10}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500">شماره موبایل</label>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`${filterInputClass} dir-ltr text-left`}
                            dir="ltr"
                            inputMode="numeric"
                            maxLength={11}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500">جنسیت</label>
                        <div
                            className="relative flex h-[38px] w-full items-center rounded-full bg-slate-200/70 p-1"
                            role="group"
                            aria-label="فیلتر جنسیت"
                        >
                            {genderOptions.map((option) => {
                                const active = gender === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setGender(option.value)}
                                        className={`relative z-10 flex-1 rounded-full py-1.5 text-xs font-medium transition-all duration-200 ${
                                            active
                                                ? 'bg-slate-600 text-white shadow-sm shadow-slate-600/30'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-12">
                    <Spinner />
                </div>
            ) : items.length === 0 ? (
                <EmptyState message="پرسنلی ثبت نشده است." />
            ) : filtered.length === 0 ? (
                <EmptyState message="پرسنلی با این فیلترها یافت نشد." />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full min-w-[720px] text-center text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-slate-600">نام</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">نام خانوادگی</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">جنسیت</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">موبایل</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">کد ملی</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">وضعیت</th>
                                <th className="px-4 py-3 font-semibold text-slate-600">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => (
                                <tr key={p.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3">{p.firstName}</td>
                                    <td className="px-4 py-3">{p.lastName}</td>
                                    <td className="px-4 py-3">{genderLabel(p.gender)}</td>
                                    <td className="px-4 py-3 dir-ltr">{p.phone}</td>
                                    <td className="px-4 py-3 dir-ltr">{p.nationalCode}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex w-20 items-center justify-center rounded-full py-0.5 text-xs font-medium ${
                                                p.active
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {p.active ? 'فعال' : 'غیرفعال'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(p)}
                                            className="inline-flex items-center justify-center gap-1 text-xs text-rose-600 hover:underline"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            ویرایش
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AddPersonnelModal
                key={editing?.id ?? 'new'}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initial={editing}
            />
        </div>
    );
}
