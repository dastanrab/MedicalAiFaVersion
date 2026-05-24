// PatientsPage.tsx
import { useState } from 'react';
import {
    Search, User, Phone, Calendar, FileText, MoreVertical,
    Filter, Eye, Edit, Trash2, Plus, ClipboardList
} from 'lucide-react';

interface Patient {
    id: string;
    fullName: string;
    nationalCode: string;
    phone: string;
    age: number;
    gender: string;
    lastVisit: string;
    totalVisits: number;
    diagnosis?: string;
}

const patients: Patient[] = [
    {
        id: '1',
        fullName: 'علی رضایی',
        nationalCode: '۰۳۱۲۳۴۵۶۷۸',
        phone: '۰۹۱۲۳۴۵۶۷۸۹',
        age: 34,
        gender: 'مرد',
        lastVisit: '۱۴۰۵/۰۳/۰۲',
        totalVisits: 8,
        diagnosis: 'دیابت نوع ۲',
    },
    {
        id: '2',
        fullName: 'مریم احمدی',
        nationalCode: '۰۵۶۲۳۴۵۶۷۸',
        phone: '۰۹۳۵۱۲۳۴۵۶۷',
        age: 28,
        gender: 'زن',
        lastVisit: '۱۴۰۵/۰۲/۲۸',
        totalVisits: 5,
        diagnosis: 'میگرن',
    },
    {
        id: '3',
        fullName: 'حسن کریمی',
        nationalCode: '۰۱۹۲۳۴۵۶۷۸',
        phone: '۰۹۱۹۸۷۶۵۴۳۲',
        age: 52,
        gender: 'مرد',
        lastVisit: '۱۴۰۵/۰۲/۲۵',
        totalVisits: 12,
        diagnosis: 'فشار خون بالا',
    },
    {
        id: '4',
        fullName: 'فاطمه محمدی',
        nationalCode: '۰۶۲۲۳۴۵۶۷۸',
        phone: '۰۹۳۰۲۱۵۴۷۸۹',
        age: 45,
        gender: 'زن',
        lastVisit: '۱۴۰۵/۰۲/۲۰',
        totalVisits: 3,
        diagnosis: 'کم‌کاری تیروئید',
    },
    {
        id: '5',
        fullName: 'سعید نوروزی',
        nationalCode: '۰۴۵۲۳۴۵۶۷۸',
        phone: '۰۹۱۲۱۲۳۴۵۶۷',
        age: 61,
        gender: 'مرد',
        lastVisit: '۱۴۰۵/۰۲/۱۵',
        totalVisits: 15,
        diagnosis: 'آرتروز زانو',
    },
    {
        id: '6',
        fullName: 'زهرا رضوانی',
        nationalCode: '۰۷۸۲۳۴۵۶۷۸',
        phone: '۰۹۳۶۵۴۳۲۱۰۹',
        age: 22,
        gender: 'زن',
        lastVisit: '۱۴۰۵/۰۲/۱۰',
        totalVisits: 2,
        diagnosis: 'آلرژی فصلی',
    },
    {
        id: '7',
        fullName: 'مهدی حسینی',
        nationalCode: '۰۲۳۲۳۴۵۶۷۸',
        phone: '۰۹۱۸۷۶۵۴۳۲۱',
        age: 41,
        gender: 'مرد',
        lastVisit: '۱۴۰۵/۰۱/۲۵',
        totalVisits: 7,
    },
];

const formatDate = (dateStr: string) => {
    // already in Jalali format, just return
    return dateStr;
};

export default function PatientsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState('all');
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

    const filteredPatients = patients.filter(p => {
        if (filterGender !== 'all' && p.gender !== filterGender) return false;
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            return (
                p.fullName.includes(s) ||
                p.nationalCode.includes(s) ||
                p.phone.includes(s)
            );
        }
        return true;
    });

    const stats = {
        total: patients.length,
        male: patients.filter(p => p.gender === 'مرد').length,
        female: patients.filter(p => p.gender === 'زن').length,
        avgAge: Math.round(patients.reduce((sum, p) => sum + p.age, 0) / patients.length),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">لیست بیماران</h1>
                    <p className="text-sm text-gray-500 mt-1">مدیریت پرونده‌ها و اطلاعات بیماران</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    ثبت بیمار جدید
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'کل بیماران', value: stats.total, icon: User, color: 'blue' },
                    { label: 'مرد', value: stats.male, icon: User, color: 'cyan' },
                    { label: 'زن', value: stats.female, icon: User, color: 'purple' },
                    { label: 'میانگین سنی', value: `${stats.avgAge} سال`, icon: Calendar, color: 'green' },
                ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                item.color === 'cyan' ? 'bg-cyan-100 text-cyan-600' :
                                    item.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                        'bg-green-100 text-green-600'
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

            {/* Search & Filter */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="جستجو با نام، کد ملی یا شماره تماس..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-9 pl-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                        value={filterGender}
                        onChange={(e) => setFilterGender(e.target.value)}
                        className="appearance-none pr-8 pl-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        <option value="all">همه</option>
                        <option value="مرد">مرد</option>
                        <option value="زن">زن</option>
                    </select>
                </div>
            </div>

            {/* Patient Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">نام بیمار</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">کد ملی</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">تلفن</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">سن</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">جنسیت</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">آخرین ویزیت</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">تعداد ویزیت‌ها</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">عملیات</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredPatients.map(patient => (
                            <tr
                                key={patient.id}
                                className="hover:bg-blue-50 transition-colors cursor-pointer"
                                onClick={() => setSelectedPatient(patient.id === selectedPatient ? null : patient.id)}
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                                            {patient.fullName[0]}
                                        </div>
                                        <span className="font-medium text-gray-800">{patient.fullName}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-700 dir-ltr">{patient.nationalCode}</td>
                                <td className="px-4 py-3 text-gray-700 dir-ltr">{patient.phone}</td>
                                <td className="px-4 py-3 text-gray-700">{patient.age}</td>
                                <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                        patient.gender === 'مرد' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>{patient.gender}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-700">{patient.lastVisit}</td>
                                <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-gray-700">
                      <ClipboardList className="w-3.5 h-3.5 text-gray-400" />
                        {patient.totalVisits}
                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-green-600">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
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
                {filteredPatients.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <User className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>بیماری با این مشخصات یافت نشد</p>
                    </div>
                )}
                <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <span>نمایش ۱ تا {Math.min(10, filteredPatients.length)} از {filteredPatients.length} بیمار</span>
                    <div className="flex gap-1">
                        <button className="w-8 h-8 rounded hover:bg-gray-100">&lt;</button>
                        <button className="w-8 h-8 rounded bg-blue-50 text-blue-600 font-medium">۱</button>
                        <button className="w-8 h-8 rounded hover:bg-gray-100">۲</button>
                        <button className="w-8 h-8 rounded hover:bg-gray-100">&gt;</button>
                    </div>
                </div>
            </div>

            {/* Selected patient quick details */}
            {selectedPatient && (
                (() => {
                    const p = patients.find(pt => pt.id === selectedPatient);
                    if (!p) return null;
                    return (
                        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-2xl font-bold">
                                        {p.fullName[0]}
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-lg font-bold text-gray-800">{p.fullName}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {p.age} سال</span>
                                            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {p.gender}</span>
                                            <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {p.phone}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">کد ملی: {p.nationalCode}</p>
                                        {p.diagnosis && (
                                            <span className="inline-block mt-2 px-3 py-1 bg-amber-50 text-amber-700 text-xs rounded-full">
                        {p.diagnosis}
                      </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                                        <FileText className="w-4 h-4" />
                                        پرونده کامل
                                    </button>
                                    <button className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm px-4 py-2 rounded-lg transition-colors">
                                        <Calendar className="w-4 h-4" />
                                        تنظیم نوبت
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()
            )}
        </div>
    );
}
