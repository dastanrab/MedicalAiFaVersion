import { useState, useMemo, useEffect } from 'react';
import {
    MessagesSquare,
    Search,
    Filter,
    Eye,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    X,
    Loader2,
    RefreshCw,
    FileSpreadsheet,
    Lock,
    AlertTriangle,
    Headphones,
    Ban,
} from 'lucide-react';
import {
    chatStatusLabels,
    chatStatusStyles,
    counterpartyTypeLabels,
    counterpartyTypeStyles,
    counterpartyTypeChipClass,
    chatFlagLabels,
    chatFlagStyles,
    maskPhone,
    type AdminChatRow,
    type ChatStatus,
    type CounterpartyType,
    type ChatFlag,
} from '../config/chatOptions';
import { sampleChats, sampleCounterparties } from '../data/sampleChats';
import { ChatDetailsModal } from '../components/ChatDetailsModal';
import {
    AdminChatsSkeleton,
    AdminChatsTableSkeleton,
} from '../components/AdminChatsSkeleton';

const PAGE_SIZE = 8;

function formatDateTime(iso: string) {
    if (!iso) return '—';
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function truncate(text: string, max = 48) {
    if (text.length <= max) return text;
    return `${text.slice(0, max)}…`;
}

function downloadChatsExcel(rows: AdminChatRow[]) {
    const header = [
        'ردیف',
        'شناسه اتاق',
        'کاربر',
        'موبایل',
        'طرف مقابل',
        'نوع',
        'آخرین پیام',
        'تاریخ',
        'وضعیت',
        'برچسب',
        'تعداد پیام',
    ];

    const body = rows
        .map(
            (r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${r.roomId}</td>
            <td>${r.patientName}</td>
            <td>${r.patientPhone}</td>
            <td>${r.counterpartyName}</td>
            <td>${counterpartyTypeLabels[r.counterpartyType]}</td>
            <td>${r.lastMessage}</td>
            <td>${formatDateTime(r.lastMessageAt)}</td>
            <td>${chatStatusLabels[r.status]}</td>
            <td>${r.flag !== 'none' ? chatFlagLabels[r.flag] : ''}</td>
            <td>${r.messageCount}</td>
        </tr>`
        )
        .join('');

    const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
            <head><meta charset="UTF-8"></head>
            <body>
                <table border="1">
                    <thead><tr>${header.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
                    <tbody>${body}</tbody>
                </table>
            </body>
        </html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chats-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
}

export function AdminChats() {
    const [chats, setChats] = useState<AdminChatRow[]>(sampleChats);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setInitialLoading(false), 400);
        return () => clearTimeout(timer);
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [phoneSearch, setPhoneSearch] = useState('');
    const [counterpartyId, setCounterpartyId] = useState<string>('all');
    const [counterpartyType, setCounterpartyType] = useState<CounterpartyType | 'all'>('all');
    const [status, setStatus] = useState<ChatStatus | 'all'>('all');

    const [page, setPage] = useState(1);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [detailsRow, setDetailsRow] = useState<AdminChatRow | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    const filtered = useMemo(() => {
        return chats.filter((row) => {
            const q = searchQuery.trim().toLowerCase();
            const matchesName =
                !q ||
                row.patientName.toLowerCase().includes(q) ||
                row.counterpartyName.toLowerCase().includes(q);
            const matchesPhone =
                !phoneSearch.trim() ||
                row.patientPhone.includes(phoneSearch.trim()) ||
                row.patientName.includes(phoneSearch.trim());
            const matchesCounterparty =
                counterpartyId === 'all' ||
                (counterpartyId === '0'
                    ? row.counterpartyType === 'support'
                    : String(row.counterpartyId) === counterpartyId);
            const matchesType =
                counterpartyType === 'all' || row.counterpartyType === counterpartyType;
            const matchesStatus = status === 'all' || row.status === status;
            return (
                matchesName && matchesPhone && matchesCounterparty && matchesType && matchesStatus
            );
        });
    }, [chats, searchQuery, phoneSearch, counterpartyId, counterpartyType, status]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const openCount = chats.filter((c) => c.status === 'open').length;
    const violationCount = chats.filter((c) => c.flag === 'violation').length;
    const referredCount = chats.filter((c) => c.flag === 'referred').length;

    const resetPage = () => setPage(1);

    const resetFilters = () => {
        setSearchQuery('');
        setPhoneSearch('');
        setCounterpartyId('all');
        setCounterpartyType('all');
        setStatus('all');
        resetPage();
    };

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setChats([...sampleChats]);
            setLoading(false);
        }, 400);
    };

    const updateChat = (id: number, patch: Partial<AdminChatRow>) => {
        setActionLoadingId(id);
        setChats((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
        setOpenMenuId(null);
        setActionLoadingId(null);
        if (detailsRow?.id === id) {
            setDetailsRow((prev) => (prev ? { ...prev, ...patch } : null));
        }
    };

    const closeChat = (id: number) => {
        updateChat(id, { status: 'closed' as ChatStatus });
    };

    const markViolation = (id: number) => {
        updateChat(id, { flag: 'violation' as ChatFlag });
    };

    const referToSupport = (id: number) => {
        const now = new Date().toISOString();
        setActionLoadingId(id);
        setChats((prev) =>
            prev.map((c) => {
                if (c.id !== id) return c;
                return {
                    ...c,
                    flag: 'referred' as ChatFlag,
                    counterpartyName: 'پشتیبانی مدیکال',
                    counterpartyType: 'support' as CounterpartyType,
                    counterpartyId: undefined,
                    messages: [
                        ...c.messages,
                        {
                            id: c.messages.length + 1,
                            sender: 'system' as const,
                            senderName: 'سیستم',
                            message: 'گفتگو از طرف ادمین به پشتیبانی ارجاع شد.',
                            sentAt: now,
                        },
                    ],
                };
            })
        );
        setOpenMenuId(null);
        setActionLoadingId(null);
    };

    const selectClass =
        'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15';

    if (initialLoading) {
        return <AdminChatsSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <MessagesSquare className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">گفتگوها</h2>
                        <p className="text-sm text-slate-500">
                            نظارت بر پیام‌های مشاوره آنلاین و چت کاربران
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => downloadChatsExcel(filtered)}
                        disabled={filtered.length === 0}
                        className="flex h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        دانلود اکسل
                    </button>
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        بروزرسانی
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">گفتگوهای باز</p>
                    <p className="mt-1 text-2xl font-semibold text-emerald-600">{openCount}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">علامت‌گذاری تخلف</p>
                    <p className="mt-1 text-2xl font-semibold text-red-600">{violationCount}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">ارجاع به پشتیبانی</p>
                    <p className="mt-1 text-2xl font-semibold text-amber-600">{referredCount}</p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Filter className="h-4 w-4" />
                        جستجو و فیلتر
                    </div>
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-xs text-slate-500 transition hover:text-indigo-600"
                    >
                        <X className="h-3.5 w-3.5" />
                        پاک کردن فیلترها
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">
                            نام کاربر یا طرف مقابل
                        </label>
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    resetPage();
                                }}
                                placeholder="جستجوی نام..."
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-9 pl-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">
                            شماره موبایل یا نام
                        </label>
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={phoneSearch}
                                onChange={(e) => {
                                    setPhoneSearch(e.target.value);
                                    resetPage();
                                }}
                                placeholder="09... یا نام"
                                dir="ltr"
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-9 pl-3 text-right text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">طرف مقابل</label>
                        <select
                            value={counterpartyId}
                            onChange={(e) => {
                                setCounterpartyId(e.target.value);
                                resetPage();
                            }}
                            className={selectClass}
                        >
                            <option value="all">همه</option>
                            {sampleCounterparties.map((cp) => (
                                <option key={cp.id} value={String(cp.id)}>
                                    {cp.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">نوع گفتگو</label>
                        <select
                            value={counterpartyType}
                            onChange={(e) => {
                                setCounterpartyType(e.target.value as CounterpartyType | 'all');
                                resetPage();
                            }}
                            className={selectClass}
                        >
                            <option value="all">همه</option>
                            <option value="doctor">پزشک</option>
                            <option value="support">پشتیبانی</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">وضعیت</label>
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as ChatStatus | 'all');
                                resetPage();
                            }}
                            className={selectClass}
                        >
                            <option value="all">همه</option>
                            {Object.entries(chatStatusLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                                <th className="w-14 px-4 py-3 font-medium">ردیف</th>
                                <th className="px-4 py-3 font-medium">کاربر</th>
                                <th className="px-4 py-3 font-medium">طرف مقابل</th>
                                <th className="px-4 py-3 font-medium">آخرین پیام</th>
                                <th className="w-36 px-4 py-3 font-medium">تاریخ</th>
                                <th className="w-28 px-4 py-3 font-medium">وضعیت</th>
                                <th className="w-28 px-4 py-3 font-medium">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <AdminChatsTableSkeleton rows={PAGE_SIZE} />
                            ) : paged.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                        گفتگویی یافت نشد
                                    </td>
                                </tr>
                            ) : (
                                paged.map((row, index) => {
                                    const rowNumber = (currentPage - 1) * PAGE_SIZE + index + 1;
                                    const isMenuOpen = openMenuId === row.id;
                                    const isRowLoading = actionLoadingId === row.id;

                                    return (
                                        <tr
                                            key={row.id}
                                            className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/60"
                                        >
                                            <td className="px-4 py-3 text-slate-500">{rowNumber}</td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-slate-800">
                                                    {row.patientName}
                                                </span>
                                                <span
                                                    className="mt-0.5 block text-xs text-slate-400"
                                                    dir="ltr"
                                                >
                                                    {maskPhone(row.patientPhone)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="font-medium text-slate-800">
                                                        {row.counterpartyName}
                                                    </span>
                                                    <span
                                                        className={`${counterpartyTypeChipClass} ${counterpartyTypeStyles[row.counterpartyType]}`}
                                                    >
                                                        {counterpartyTypeLabels[row.counterpartyType]}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-slate-600">
                                                    {truncate(row.lastMessage)}
                                                </span>
                                                {row.flag !== 'none' && (
                                                    <span
                                                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${chatFlagStyles[row.flag]}`}
                                                    >
                                                        {chatFlagLabels[row.flag]}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500">
                                                {formatDateTime(row.lastMessageAt)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex w-16 justify-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${chatStatusStyles[row.status]}`}
                                                >
                                                    {chatStatusLabels[row.status]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        title="مشاهده گفتگو"
                                                        disabled={isRowLoading}
                                                        onClick={() => setDetailsRow(row)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>

                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            title="عملیات بیشتر"
                                                            disabled={isRowLoading}
                                                            onClick={() =>
                                                                setOpenMenuId(isMenuOpen ? null : row.id)
                                                            }
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                                        >
                                                            {isRowLoading ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <MoreVertical className="h-5 w-5" />
                                                            )}
                                                        </button>

                                                        {isMenuOpen && (
                                                            <>
                                                                <div
                                                                    className="fixed inset-0 z-10"
                                                                    onClick={() => setOpenMenuId(null)}
                                                                />
                                                                <div className="absolute left-0 top-10 z-20 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                                                                    <p className="px-4 py-2 text-xs text-slate-400">
                                                                        اقدامات نظارتی
                                                                    </p>
                                                                    {row.status === 'open' && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => closeChat(row.id)}
                                                                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                                                                        >
                                                                            <Lock className="h-4 w-4" />
                                                                            بستن گفتگو
                                                                        </button>
                                                                    )}
                                                                    {row.flag !== 'violation' && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                markViolation(row.id)
                                                                            }
                                                                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                                                                        >
                                                                            <AlertTriangle className="h-4 w-4" />
                                                                            علامت‌گذاری تخلف
                                                                        </button>
                                                                    )}
                                                                    {row.flag !== 'referred' &&
                                                                        row.counterpartyType !== 'support' && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    referToSupport(row.id)
                                                                                }
                                                                                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-amber-700 transition hover:bg-amber-50"
                                                                            >
                                                                                <Headphones className="h-4 w-4" />
                                                                                ارجاع به پشتیبانی
                                                                            </button>
                                                                        )}
                                                                    {row.status === 'closed' && (
                                                                        <>
                                                                            <div className="my-1 border-t border-slate-100" />
                                                                            <p className="flex items-center gap-2 px-4 py-2 text-xs text-slate-400">
                                                                                <Ban className="h-3.5 w-3.5" />
                                                                                گفتگو بسته شده
                                                                            </p>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                    <span>
                        نمایش {paged.length} از {filtered.length} گفتگو
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            disabled={currentPage <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPage(p)}
                                className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs transition ${
                                    p === currentPage
                                        ? 'bg-indigo-600 text-white'
                                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            type="button"
                            disabled={currentPage >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {detailsRow && (
                <ChatDetailsModal chat={detailsRow} onClose={() => setDetailsRow(null)} />
            )}
        </div>
    );
}
