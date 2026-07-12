import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { PageHeader, EmptyState, formatPrice } from '../../components';
import { Spinner } from '../../../components/PageLoader';
import { AddEditServiceModal } from '../../components/AddEditServiceModal';
import {
    createNurseService,
    fetchNurseServices,
    toggleNurseServiceActive,
    updateNurseService,
} from '../../services/nurseApi';
import type { NurseService } from '../../data/mockData';
import type { NurseServiceInput } from '../../store/nurseStore';

export function NurseServicesPage() {
    const [items, setItems] = useState<NurseService[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<NurseService | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setItems(await fetchNurseServices());
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

    const openEdit = (item: NurseService) => {
        setEditing(item);
        setModalOpen(true);
    };

    const handleSubmit = async (input: NurseServiceInput) => {
        if (editing) {
            await updateNurseService(editing.id, input);
        } else {
            await createNurseService(input);
        }
        await load();
        setModalOpen(false);
    };

    const handleToggle = async (id: number) => {
        await toggleNurseServiceActive(id);
        await load();
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="خدمات درمانی"
                description="مدیریت خدمات پرستاری و نرخ‌ها"
                actions={
                    <button
                        type="button"
                        onClick={openAdd}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                    >
                        <Plus className="h-4 w-4" />
                        افزودن خدمت
                    </button>
                }
            />

            {loading ? (
                <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-12">
                    <Spinner />
                </div>
            ) : items.length === 0 ? (
                <EmptyState message="خدمتی ثبت نشده است." />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full min-w-[560px] text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">نام خدمت</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">نرخ خدمت</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">وضعیت</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((s) => (
                                <tr key={s.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{s.name}</p>
                                        {s.description && (
                                            <p className="text-xs text-slate-400">{s.description}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{formatPrice(s.price)} تومان</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                s.active
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {s.active ? 'فعال' : 'غیرفعال'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(s)}
                                                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                ویرایش
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleToggle(s.id)}
                                                className="text-xs text-slate-500 hover:underline"
                                            >
                                                {s.active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AddEditServiceModal
                key={editing?.id ?? 'new'}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initial={editing}
            />
        </div>
    );
}
