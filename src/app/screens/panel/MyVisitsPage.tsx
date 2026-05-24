// MyVisitsPage.tsx
import { useState } from 'react';
import {
    Calendar, Clock, User, Stethoscope, FileText,
    CheckCircle, XCircle, AlertCircle, Search, Filter,
    ChevronLeft, ChevronRight, MoreVertical, Eye, Download
} from 'lucide-react';

interface Visit {
    id: string;
    patientName: string;
    patientId: string;
    date: string;
    time: string;
    type: string;
    status: 'completed' | 'pending' | 'cancelled';
    diagnosis?: string;
    prescriptionCount: number;
    notes?: string;
    duration: string;
}

const visits: Visit[] = [
    {
        id: 'v1',
        patientName: 'علی رضایی',
        patientId: 'P-001',
        date: '۱۴۰۵/۰۳/۰۲',
        time: '۰۹:۱۵',
        type: 'ویزیت جدید',
        status: 'completed',
        diagnosis: 'دیابت نوع ۲',
        prescriptionCount: 2,
        notes: 'نیاز به آزمایش خون',
        duration: '۲۰ دقیقه',
    },
    {
        id: 'v2',
        patientName: 'مریم احمدی',
        patientId: 'P-002',
        date: '۱۴۰۵/۰۳/۰۲',
        time: '۱۰:۳۰',
        type: 'پیگیری',
        status: 'completed',
        diagnosis: 'میگرن',
        prescriptionCount: 1,
        duration: '۱۵ دقیقه',
    },
    {
        id: 'v3',
        patientName: 'حسن کریمی',
        patientId: 'P-003',
        date: '۱۴۰۵/۰۳/۰۱',
        time: '۱۱:۰۰',
        type: 'ویزیت مجدد',
        status: 'completed',
        diagnosis: 'فشار خون بالا',
        prescriptionCount: 3,
        notes: 'کنترل فشار خون هفتگی',
        duration: '۲۵ دقیقه',
    },
    {
        id: 'v4',
        patientName: 'فاطمه محمدی',
        patientId: 'P-004',
        date: '۱۴۰۵/۰۲/۲۹',
        time: '۱۴:۱۵',
        type: 'مشاوره',
        status: 'completed',
        prescriptionCount: 0,
        duration: '۳۰ دقیقه',
    },
    {
        id: 'v5',
        patientName: 'سعید نوروزی',
        patientId: 'P-005',
        date: '۱۴۰۵/۰۲/۲۸',
        time: '۱۶:۴۵',
        type: 'ویزیت جدید',
        status: 'completed',
        diagnosis: 'آرتروز زانو',
        prescriptionCount: 1,
        duration: '۳۵ دقیقه',
    },
    {
        id: 'v7',
        patientName: 'مهدی حسینی',
        patientId: 'P-007',
        date: '۱۴۰۵/۰۲/۲۶',
        time: '۱۳:۲۰',
        type: 'ویزیت مجدد',
        status: 'completed',
        diagnosis: 'آسم',
        prescriptionCount: 2,
        duration: '۲۲ دقیقه',
    }
];

const statusConfig = {
    completed: { label: 'انجام شده', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    pending: { label: 'در انتظار', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
    cancelled: { label: 'لغو شده', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function MyVisitsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedVisit, setSelectedVisit] = useState<string | null>(null);

    const filteredVisits = visits.filter(visit => {
        if (statusFilter !== 'all' && visit.status !== statusFilter) return false;
        if (dateFilter !== 'all') {
            const today = '۱۴۰۵/۰۳/۰۲'; // current date for demo
            if (dateFilter === 'today' && visit.date !== today) return false;
            if (dateFilter === 'week' && visit.date < '۱۴۰۵/۰۲/۲۶') return false; // last 7 days
        }
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            return (
                visit.patientName.includes(s) ||
                visit.patientId.toLowerCase().includes(s) ||
                (visit.diagnosis && visit.diagnosis.includes(s))
            );
        }
        return true;
    });

    const stats = {
        total: visits.length,
        completed: visits.filter(v => v.status === 'completed').length,
        pending: visits.filter(v => v.status === 'pending').length,
        cancelled: visits.filter(v => v.status === 'cancelled').length,
    };

    const getStatusIcon = (status: Visit['status']) => {
        const Icon = statusConfig[status].icon;
        return <Icon className="w-4 h-4" />;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">ویزیت‌های من</h1>
                    <p className="text-sm text-gray-500 mt-1">تاریخچه و مدیریت ویزیت‌های انجام شده</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        خروجی گزارش
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
                        <Calendar className="w-4 h-4" />
                        تقویم ویزیت‌ها
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'کل ویزیت‌ها', value: stats.total, color: 'blue', icon: Stethoscope },
                    { label: 'انجام شده', value: stats.completed, color: 'green', icon: CheckCircle },
                    { label: 'در انتظار', value: stats.pending, color: 'amber', icon: AlertCircle },
                    { label: 'لغو شده', value: stats.cancelled, color: 'red', icon: XCircle },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                stat.color === 'green' ? 'bg-green-100 text-green-600' :
                                    stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                                        'bg-red-100 text-red-600'
                        }`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">{stat.label}</p>
                            <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="جستجوی بیمار، شماره پرونده یا تشخیص..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-9 pl-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-200 bg-white rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-300"
                        >
                            <option value="all">همه وضعیت‌ها</option>
                            <option value="completed">انجام شده</option>
                            <option value="pending">در انتظار</option>
                            <option value="cancelled">لغو شده</option>
                        </select>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="border border-gray-200 bg-white rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-300"
                        >
                            <option value="all">همه تاریخ‌ها</option>
                            <option value="today">امروز</option>
                            <option value="week">هفته جاری</option>
                            <option value="month">ماه جاری</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Visits Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">بیمار</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">تاریخ و زمان</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">نوع ویزیت</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">تشخیص</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">مدت زمان</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">وضعیت</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">عملیات</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredVisits.map(visit => (
                            <tr
                                key={visit.id}
                                className="hover:bg-blue-50 transition-colors cursor-pointer"
                                onClick={() => setSelectedVisit(visit.id === selectedVisit ? null : visit.id)}
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                                            {visit.patientName[0]}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-800">{visit.patientName}</p>
                                            <p className="text-xs text-gray-500">پرونده: {visit.patientId}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-right">
                                        <p className="text-gray-700">{visit.date}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {visit.time}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-gray-700">
                      <Stethoscope className="w-3.5 h-3.5 text-gray-400" />
                        {visit.type}
                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {visit.diagnosis ? (
                                        <span className="text-sm text-gray-700">{visit.diagnosis}</span>
                                    ) : (
                                        <span className="text-xs text-gray-400">--</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-gray-700">{visit.duration}</td>
                                <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusConfig[visit.status].color}`}>
                      {getStatusIcon(visit.status)}
                        {statusConfig[visit.status].label}
                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-green-600">
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {filteredVisits.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <Stethoscope className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>ویزیتی با این فیلترها یافت نشد</p>
                    </div>
                )}
                <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <span>نمایش ۱ تا {Math.min(10, filteredVisits.length)} از {filteredVisits.length} ویزیت</span>
                    <div className="flex gap-1">
                        <button className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded bg-blue-50 text-blue-600 font-medium">۱</button>
                        <button className="w-8 h-8 rounded hover:bg-gray-100">۲</button>
                        <button className="w-8 h-8 rounded hover:bg-gray-100">۳</button>
                        <button className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Selected Visit Details */}
            {selectedVisit && (() => {
                const visit = visits.find(v => v.id === selectedVisit);
                if (!visit) return null;
                const StatusIcon = statusConfig[visit.status].icon;

                return (
                    <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-2xl font-bold">
                                    {visit.patientName[0]}
                                </div>
                                <div className="text-right">
                                    <h3 className="text-lg font-bold text-gray-800">{visit.patientName}</h3>
                                    <p className="text-sm text-gray-500">شماره پرونده: {visit.patientId}</p>
                                    <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                        {visit.date}
                    </span>
                                        <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                                            {visit.time}
                    </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${statusConfig[visit.status].color}`}>
                  <StatusIcon className="w-4 h-4" />
                    {statusConfig[visit.status].label}
                </span>
                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">نوع ویزیت</p>
                                <p className="text-sm font-medium text-gray-800">{visit.type}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">مدت زمان</p>
                                <p className="text-sm font-medium text-gray-800">{visit.duration}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">تعداد نسخه</p>
                                <p className="text-sm font-medium text-gray-800">{visit.prescriptionCount} مورد</p>
                            </div>
                        </div>

                        {visit.diagnosis && (
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">تشخیص</p>
                                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                                    <p className="text-sm text-amber-800">{visit.diagnosis}</p>
                                </div>
                            </div>
                        )}

                        {visit.notes && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">یادداشت‌ها</p>
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                    <p className="text-sm text-blue-800">{visit.notes}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                                <FileText className="w-4 h-4" />
                                مشاهده پرونده کامل
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                                <User className="w-4 h-4" />
                                نوبت جدید برای بیمار
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
