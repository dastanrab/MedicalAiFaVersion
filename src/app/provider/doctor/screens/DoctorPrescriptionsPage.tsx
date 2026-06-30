import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { PageHeader, EmptyState } from '../../components';
import { mockDoctorPrescriptions } from '../data/mockDoctorData';
import { ProviderModal } from '../../components/ProviderModal';

interface MedicineRow {
    name: string;
    dosage: string;
    duration: string;
}

export function DoctorPrescriptionsPage() {
    const [prescriptions] = useState(mockDoctorPrescriptions);
    const [showModal, setShowModal] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');
    const [doctorNotes, setDoctorNotes] = useState('');
    const [medicines, setMedicines] = useState<MedicineRow[]>([
        { name: '', dosage: '', duration: '' },
    ]);

    const addMedicine = () => {
        setMedicines((prev) => [...prev, { name: '', dosage: '', duration: '' }]);
    };

    const removeMedicine = (index: number) => {
        setMedicines((prev) => prev.filter((_, i) => i !== index));
    };

    const updateMedicine = (index: number, field: keyof MedicineRow, value: string) => {
        setMedicines((prev) =>
            prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
        );
    };

    const handleCreate = () => {
        // TODO: ارسال نسخه جدید به API
        setShowModal(false);
        setDiagnosis('');
        setDoctorNotes('');
        setMedicines([{ name: '', dosage: '', duration: '' }]);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="نسخه‌ها"
                description="مشاهده و صدور نسخه پزشکی"
                actions={
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        نسخه جدید
                    </button>
                }
            />

            {prescriptions.length === 0 ? (
                <EmptyState message="نسخه‌ای ثبت نشده." />
            ) : (
                <div className="space-y-4">
                    {prescriptions.map((rx) => (
                        <div key={rx.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-slate-800">{rx.patientName}</p>
                                    <p className="mt-1 text-sm text-blue-700">{rx.diagnosis}</p>
                                </div>
                                <span className="text-xs text-slate-400">{rx.date}</span>
                            </div>
                            <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-2 text-right font-semibold text-slate-600">دارو</th>
                                            <th className="px-4 py-2 text-right font-semibold text-slate-600">دوز</th>
                                            <th className="px-4 py-2 text-right font-semibold text-slate-600">مدت</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rx.medicines.map((m, i) => (
                                            <tr key={i} className="border-t border-slate-100">
                                                <td className="px-4 py-2">{m.name}</td>
                                                <td className="px-4 py-2">{m.dosage}</td>
                                                <td className="px-4 py-2">{m.duration}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {rx.doctorNotes && (
                                <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
                                    توضیحات پزشک: {rx.doctorNotes}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <ProviderModal
                open={showModal}
                onClose={() => setShowModal(false)}
                title="صدور نسخه جدید"
            >
                <div className="space-y-4">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-500">تشخیص</span>
                        <input
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                            placeholder="تشخیص پزشکی"
                        />
                    </label>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs text-slate-500">داروها</span>
                            <button
                                type="button"
                                onClick={addMedicine}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                + افزودن دارو
                            </button>
                        </div>
                        <div className="space-y-2">
                            {medicines.map((m, i) => (
                                <div key={i} className="flex flex-wrap items-center gap-2">
                                    <input
                                        value={m.name}
                                        onChange={(e) => updateMedicine(i, 'name', e.target.value)}
                                        placeholder="نام دارو"
                                        className="min-w-[120px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                    />
                                    <input
                                        value={m.dosage}
                                        onChange={(e) => updateMedicine(i, 'dosage', e.target.value)}
                                        placeholder="دوز"
                                        className="w-28 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                    />
                                    <input
                                        value={m.duration}
                                        onChange={(e) => updateMedicine(i, 'duration', e.target.value)}
                                        placeholder="مدت"
                                        className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                    />
                                    {medicines.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMedicine(i)}
                                            className="text-slate-400 hover:text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-500">توضیحات پزشک</span>
                        <textarea
                            value={doctorNotes}
                            onChange={(e) => setDoctorNotes(e.target.value)}
                            rows={3}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                            placeholder="توصیه‌ها و نکات..."
                        />
                    </label>

                    <button
                        type="button"
                        onClick={handleCreate}
                        className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        ثبت نسخه
                    </button>
                </div>
            </ProviderModal>
        </div>
    );
}
