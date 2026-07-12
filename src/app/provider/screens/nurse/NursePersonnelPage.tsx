import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { PageHeader, EmptyState } from '../../components';
import { Spinner } from '../../../components/PageLoader';
import { AddPersonnelModal } from '../../components/AddPersonnelModal';
import {
    createNursePersonnel,
    fetchNursePersonnel,
    updateNursePersonnel,
} from '../../services/nurseApi';
import type { NursePersonnel } from '../../data/mockData';

export function NursePersonnelPage() {
    const [items, setItems] = useState<NursePersonnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<NursePersonnel | null>(null);

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
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                    >
                        <Plus className="h-4 w-4" />
                        افزودن پرسنل
                    </button>
                }
            />

            {loading ? (
                <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-12">
                    <Spinner />
                </div>
            ) : items.length === 0 ? (
                <EmptyState message="پرسنلی ثبت نشده است." />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">نام</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">نام خانوادگی</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">موبایل</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">کد ملی</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">وضعیت</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((p) => (
                                <tr key={p.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3">{p.firstName}</td>
                                    <td className="px-4 py-3">{p.lastName}</td>
                                    <td className="px-4 py-3 dir-ltr text-left">{p.phone}</td>
                                    <td className="px-4 py-3 dir-ltr text-left">{p.nationalCode}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
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
                                            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline"
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
