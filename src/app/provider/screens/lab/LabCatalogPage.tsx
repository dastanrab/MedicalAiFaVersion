import { useState, useEffect } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { PageHeader, formatPrice } from '../../components';
import {AddEditLabTestModal, LabTestPayload} from '../../components/AddEditLabTestModal';
import {useProviderSession} from "../../store/providerAuthStore";

// تعریف تایپ بر اساس خروجی API
export interface ApiLabTest {
    id: number;
    test_pack_id: number;
    price: string;
    status: number;
    description: string;
    test_pack_name: string;
}

export function LabCatalogPage() {
    const labSession = useProviderSession('lab');
    const [tests, setTests] = useState<ApiLabTest[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    // برای ویرایش می‌توانید تایپ را با تایپ مودال خود هماهنگ کنید
    const [editing, setEditing] = useState<any | null>(null);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://185.222.163.113:7000/api/owner/lab/tests', {
                headers: {
                    'Authorization': `Bearer ${labSession?.token}`,
                    'Accept': 'application/json'
                }
            });
            const json = await res.json();
            if (json.status) {
                setTests(json.data);
            }
        } catch (error) {
            console.error('Error fetching tests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (labSession?.token) {
            fetchTests();
        }
    }, [labSession?.token]);

    const openAdd = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (item: ApiLabTest) => {
        // مپ کردن داده‌های API به ساختاری که مودال شما انتظار دارد
        setEditing({
            id: item.id,
            name: item.test_pack_name,
            price: Number(item.price),
            active: item.status === 1,
            description: item.description,
            test_pack_id: item.test_pack_id
        });
        setModalOpen(true);
    };

    // درون کامپوننت LabCatalogPage

    const handleSubmit = async (payload: LabTestPayload) => {
        try {
            const url = editing
                ? `http://185.222.163.113:7000/api/owner/lab/tests/${editing.id}` // مسیر آپدیت (PUT)
                : 'http://185.222.163.113:7000/api/owner/lab/tests'; // مسیر ذخیره (POST)

            const method = editing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${labSession?.token}`
                },
                body: JSON.stringify(payload)
            });

            const json = await res.json();

            if (json.status) {
                // بستن مودال و رفرش لیست
                setModalOpen(false);
                fetchTests();
            } else {
                // مدیریت خطای ولیدیشن (مثلا خطای ۴۲۲)
                throw new Error(json.message || 'خطا در ذخیره اطلاعات');
            }
        } catch (error: any) {
            throw new Error(error.message); // پرتاب خطا به مودال برای نمایش به کاربر
        }
    };


    const toggleStatus = async (id: number, currentStatus: number) => {
        // اینجا باید API مربوط به تغییر وضعیت را صدا بزنید
        console.log('Toggle status for', id, 'to', currentStatus === 1 ? 0 : 1);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="کاتالوگ آزمایش‌ها"
                description="مدیریت لیست آزمایش‌های قابل ارائه"
                actions={
                    <button
                        type="button"
                        onClick={openAdd}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                    >
                        <Plus className="h-4 w-4" />
                        افزودن آزمایش
                    </button>
                }
            />

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                    <tr>
                        <th className="px-4 py-3 text-right font-semibold">نام</th>
                        <th className="px-4 py-3 text-right font-semibold">نرخ</th>
                        <th className="px-4 py-3 text-right font-semibold">وضعیت</th>
                        <th className="px-4 py-3 text-right font-semibold">عملیات</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                در حال بارگذاری...
                            </td>
                        </tr>
                    ) : tests.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                آزمایشی یافت نشد.
                            </td>
                        </tr>
                    ) : (
                        tests.map((item) => (
                            <tr key={item.id} className="border-t border-slate-100">
                                <td className="px-4 py-3">
                                    <p className="font-medium">{item.test_pack_name}</p>
                                    {item.description && (
                                        <p className="text-xs text-slate-400 mt-1 max-w-md truncate">
                                            {item.description}
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {formatPrice(Number(item.price))}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                item.status === 1
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {item.status === 1 ? 'فعال' : 'غیرفعال'}
                                        </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(item)}
                                            className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            ویرایش
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleStatus(item.id, item.status)}
                                            className="text-xs text-slate-500 hover:text-amber-600"
                                        >
                                            {item.status === 1 ? 'غیرفعال' : 'فعال'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            <AddEditLabTestModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initial={editing}
            />
        </div>
    );
}
