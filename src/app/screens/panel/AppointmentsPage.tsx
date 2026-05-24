// AppointmentsPage.tsx
import { useState } from 'react';
import {
    Calendar, Clock, User, Phone, Search, Plus, Filter,
    ChevronLeft, ChevronRight, MoreVertical, Edit, Trash2,
    CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

// Types for appointment data
interface Appointment {
    id: string;
    patientName: string;
    time: string;
    type: 'ویزیت' | 'پیگیری' | 'مشاوره' | 'جراحی';
    status: 'confirmed' | 'pending' | 'cancelled';
    phone: string;
    notes?: string;
}

// Sample data
const todayAppointments: Appointment[] = [
    {
        id: '1',
        patientName: 'علی رضایی',
        time: '۰۹:۰۰',
        type: 'ویزیت',
        status: 'confirmed',
        phone: '۰۹۱۲۳۴۵۶۷۸۹',
    },
    {
        id: '2',
        patientName: 'مریم احمدی',
        time: '۰۹:۳۰',
        type: 'پیگیری',
        status: 'confirmed',
        phone: '۰۹۳۵۱۲۳۴۵۶۷',
    },
    {
        id: '3',
        patientName: 'حسن کریمی',
        time: '۱۰:۰۰',
        type: 'مشاوره',
        status: 'pending',
        phone: '۰۹۱۹۸۷۶۵۴۳۲',
    },
    {
        id: '4',
        patientName: 'فاطمه محمدی',
        time: '۱۰:۳۰',
        type: 'ویزیت',
        status: 'confirmed',
        phone: '۰۹۳۰۲۱۵۴۷۸۹',
    },
    {
        id: '5',
        patientName: 'سعید نوروزی',
        time: '۱۱:۰۰',
        type: 'جراحی',
        status: 'cancelled',
        phone: '۰۹۱۲۱۲۳۴۵۶۷',
    },
];

const weekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
// Generate current month days (simplified)
const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

export default function AppointmentsPage() {
    const [selectedDate, setSelectedDate] = useState(15);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAppointments = todayAppointments.filter(apt => {
        if (filterStatus !== 'all' && apt.status !== filterStatus) return false;
        if (searchTerm && !apt.patientName.includes(searchTerm)) return false;
        return true;
    });

    const stats = {
        total: todayAppointments.length,
        confirmed: todayAppointments.filter(a => a.status === 'confirmed').length,
        pending: todayAppointments.filter(a => a.status === 'pending').length,
        cancelled: todayAppointments.filter(a => a.status === 'cancelled').length,
    };

    const statusColor = {
        confirmed: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    const typeIcon = {
        'ویزیت': <User className="w-4 h-4" />,
        'پیگیری': <Phone className="w-4 h-4" />,
        'مشاوره': <Search className="w-4 h-4" />,
        'جراحی': <Plus className="w-4 h-4" />,
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">نوبت‌دهی / پذیرش</h1>
                    <p className="text-sm text-gray-500 mt-1">مدیریت نوبت‌ها و برنامه‌ریزی ویزیت‌ها</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    نوبت جدید
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'کل نوبت‌ها', value: stats.total, icon: Calendar, color: 'blue' },
                    { label: 'تایید شده', value: stats.confirmed, icon: CheckCircle, color: 'green' },
                    { label: 'در انتظار', value: stats.pending, icon: AlertCircle, color: 'yellow' },
                    { label: 'لغو شده', value: stats.cancelled, icon: XCircle, color: 'red' },
                ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                item.color === 'green' ? 'bg-green-100 text-green-600' :
                                    item.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                                        'bg-red-100 text-red-600'
                        }`}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">{item.label}</p>
                            <p className="text-lg font-bold text-gray-800">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Calendar + Appointment List */}
            <div className="grid grid-cols-3 gap-6">
                {/* Mini Calendar */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-4">
                        <button className="p-1 rounded hover:bg-gray-100">
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                        </button>
                        <h3 className="text-sm font-semibold text-gray-700">خرداد ۱۴۰۵</h3>
                        <button className="p-1 rounded hover:bg-gray-100">
                            <ChevronLeft className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                        {weekDays.map(d => <div key={d}>{d.slice(0,1)}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {monthDays.map(day => (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(day)}
                                className={`w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors ${
                                    day === selectedDate
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'hover:bg-blue-50 text-gray-700'
                                }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">تاریخ انتخاب شده</p>
                        <p className="text-sm font-medium text-gray-800">{selectedDate} / ۳ / ۱۴۰۵</p>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-700">
                            نوبت‌های امروز ({todayAppointments.length} نوبت)
                        </h3>
                        <div className="flex items-center gap-2">
                            {/* Filter */}
                            <div className="relative">
                                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="appearance-none pr-8 pl-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    <option value="all">همه وضعیت‌ها</option>
                                    <option value="confirmed">تایید شده</option>
                                    <option value="pending">در انتظار</option>
                                    <option value="cancelled">لغو شده</option>
                                </select>
                            </div>
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="جستجوی بیمار..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-8 pl-3 py-1.5 text-xs border border-gray-200 rounded-lg w-40 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Appointment Cards */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {filteredAppointments.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p>نوبتی یافت نشد</p>
                            </div>
                        ) : (
                            filteredAppointments.map(apt => (
                                <div key={apt.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-blue-50 transition-colors group">
                                    {/* Time */}
                                    <div className="flex-shrink-0 w-14 text-center">
                    <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded-md block">
                      {apt.time}
                    </span>
                                    </div>
                                    {/* Avatar + Info */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                                            {apt.patientName[0]}
                                        </div>
                                        <div className="text-right flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{apt.patientName}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          {typeIcon[apt.type]}
                            {apt.type}
                        </span>
                                                <span className="text-xs text-gray-400">|</span>
                                                <span className="text-xs text-gray-500">{apt.phone}</span>
                                            </div>
                                        </div>
                                        {/* Status Badge */}
                                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor[apt.status]}`}>
                      {apt.status === 'confirmed' ? 'تایید شده' : apt.status === 'pending' ? 'در انتظار' : 'لغو شده'}
                    </span>
                                    </div>
                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-600">
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600">
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* View All */}
                    <button className="w-full mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                        مشاهده همه نوبت‌ها
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">دسترسی سریع</h3>
                <div className="grid grid-cols-6 gap-4">
                    {[
                        { icon: Plus, label: 'ثبت نوبت جدید', color: 'blue' },
                        { icon: Calendar, label: 'تقویم کامل', color: 'cyan' },
                        { icon: Clock, label: 'ساعات کاری', color: 'green' },
                        { icon: User, label: 'لیست انتظار', color: 'purple' },
                        { icon: Phone, label: 'تماس با بیمار', color: 'orange' },
                        { icon: AlertCircle, label: 'نوبت‌های فوری', color: 'red' },
                    ].map((item, i) => (
                        <button key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                    item.color === 'cyan' ? 'bg-cyan-100 text-cyan-600' :
                                        item.color === 'green' ? 'bg-green-100 text-green-600' :
                                            item.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                                item.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-red-100 text-red-600'
                            }`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs text-gray-600">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
