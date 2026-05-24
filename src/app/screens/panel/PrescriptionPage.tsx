// PrescriptionPage.tsx
import { useState } from 'react';
import {
    FileText, Search, Plus, Trash2, Save, Printer, User,
    Calendar, Clock, AlertCircle, Pill, Stethoscope, ChevronDown
} from 'lucide-react';

// Sample drug data
const drugDatabase = [
    { id: '1', name: 'استامینوفن', category: 'مسکن', dosageForms: ['قرص ۵۰۰ میلی‌گرم', 'شربت ۱۲۰ میلی‌گرم/۵ سی‌سی'] },
    { id: '2', name: 'آموکسی‌سیلین', category: 'آنتی‌بیوتیک', dosageForms: ['کپسول ۵۰۰ میلی‌گرم', 'سوسپانسیون ۲۵۰ میلی‌گرم/۵ سی‌سی'] },
    { id: '3', name: 'لوراتادین', category: 'آنتی‌هیستامین', dosageForms: ['قرص ۱۰ میلی‌گرم', 'شربت ۵ میلی‌گرم/۵ سی‌سی'] },
    { id: '4', name: 'متفورمین', category: 'ضد دیابت', dosageForms: ['قرص ۵۰۰ میلی‌گرم', 'قرص ۱۰۰۰ میلی‌گرم'] },
    { id: '5', name: 'آتورواستاتین', category: 'کاهنده چربی', dosageForms: ['قرص ۲۰ میلی‌گرم', 'قرص ۴۰ میلی‌گرم'] },
    { id: '6', name: 'امپرازول', category: 'گوارشی', dosageForms: ['کپسول ۲۰ میلی‌گرم', 'کپسول ۴۰ میلی‌گرم'] },
];

interface PrescriptionItem {
    drugId: string;
    drugName: string;
    dosageForm: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

const recentPatients = [
    { id: 'p1', name: 'علی رضایی', fileNumber: '۴۵۲۱' },
    { id: 'p2', name: 'مریم احمدی', fileNumber: '۱۲۸۹' },
    { id: 'p3', name: 'حسن کریمی', fileNumber: '۳۶۵۴' },
];

const frequencies = ['روزی ۱ بار', 'روزی ۲ بار', 'روزی ۳ بار', 'هر ۶ ساعت', 'هر ۸ ساعت', 'هر ۱۲ ساعت', 'قبل از خواب'];
const durations = ['۳ روز', '۵ روز', '۱ هفته', '۱۰ روز', '۲ هفته', '۱ ماه', 'در صورت نیاز'];

export default function PrescriptionPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDrug, setSelectedDrug] = useState('');
    const [selectedDosage, setSelectedDosage] = useState('');
    const [dose, setDose] = useState('');
    const [frequency, setFrequency] = useState(frequencies[0]);
    const [duration, setDuration] = useState(durations[0]);
    const [instructions, setInstructions] = useState('');
    const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<string>('p1');

    const filteredDrugs = drugDatabase.filter(
        d => d.name.includes(searchQuery) || d.category.includes(searchQuery)
    );

    const selectedDrugObj = drugDatabase.find(d => d.name === selectedDrug);

    const addItem = () => {
        if (!selectedDrug || !selectedDosage || !dose || !frequency || !duration) return;
        const newItem: PrescriptionItem = {
            drugId: selectedDrugObj?.id || '',
            drugName: selectedDrug,
            dosageForm: selectedDosage,
            dose,
            frequency,
            duration,
            instructions: instructions || undefined,
        };
        setPrescriptionItems([...prescriptionItems, newItem]);
        // Reset selection
        setSelectedDrug('');
        setSelectedDosage('');
        setDose('');
        setInstructions('');
    };

    const removeItem = (index: number) => {
        setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
    };

    const currentPatient = recentPatients.find(p => p.id === selectedPatient);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">تجویز نسخه</h1>
                    <p className="text-sm text-gray-500 mt-1">ثبت نسخه الکترونیک با پشتیبانی بیمه</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
                        <Printer className="w-4 h-4" />
                        پیش‌نمایش چاپ
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
                        <Save className="w-4 h-4" />
                        ذخیره نسخه
                    </button>
                </div>
            </div>

            {/* Main content - 2 columns */}
            <div className="grid grid-cols-3 gap-6">
                {/* Left column: Drug selection form */}
                <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    {/* Patient selection */}
                    <div className="flex items-center gap-3 mb-5 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                            {currentPatient?.name[0]}
                        </div>
                        <div className="text-right flex-1">
                            <p className="text-sm font-medium text-gray-800">بیمار: {currentPatient?.name}</p>
                            <p className="text-xs text-gray-500">شماره پرونده: {currentPatient?.fileNumber}</p>
                        </div>
                        <select
                            value={selectedPatient}
                            onChange={(e) => setSelectedPatient(e.target.value)}
                            className="border border-gray-200 bg-white rounded-lg text-xs px-3 py-1.5 focus:ring-2 focus:ring-blue-300"
                        >
                            {recentPatients.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-blue-600" />
                        افزودن دارو به نسخه
                    </h3>

                    {/* Search drug */}
                    <div className="relative mb-4">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="جستجوی نام دارو یا دسته..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-9 pl-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
                        />
                    </div>

                    {/* Drug list */}
                    <div className="grid grid-cols-2 gap-2 mb-4 max-h-48 overflow-y-auto">
                        {searchQuery && filteredDrugs.map(drug => (
                            <button
                                key={drug.id}
                                onClick={() => {
                                    setSelectedDrug(drug.name);
                                    setSelectedDosage(''); // reset dosage when drug changes
                                    setSearchQuery(''); // hide list after selection
                                }}
                                className={`p-2 text-sm text-right rounded-lg border transition-colors ${
                                    selectedDrug === drug.name
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                                <span className="font-medium">{drug.name}</span>
                                <span className="text-xs text-gray-400 mr-2">{drug.category}</span>
                            </button>
                        ))}
                        {searchQuery && filteredDrugs.length === 0 && (
                            <p className="text-xs text-gray-400 p-2">دارویی یافت نشد</p>
                        )}
                    </div>

                    {/* Selected drug details form */}
                    {selectedDrug && selectedDrugObj && (
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-800">{selectedDrug}</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">شکل دارویی</label>
                                    <select
                                        value={selectedDosage}
                                        onChange={(e) => setSelectedDosage(e.target.value)}
                                        className="w-full border border-gray-200 bg-white rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-300"
                                    >
                                        <option value="">انتخاب...</option>
                                        {selectedDrugObj.dosageForms.map(df => (
                                            <option key={df} value={df}>{df}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">دوز (مقدار)</label>
                                    <input
                                        type="text"
                                        placeholder="مثلاً ۱ عدد"
                                        value={dose}
                                        onChange={(e) => setDose(e.target.value)}
                                        className="w-full border border-gray-200 bg-white rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">زمان مصرف</label>
                                    <select
                                        value={frequency}
                                        onChange={(e) => setFrequency(e.target.value)}
                                        className="w-full border border-gray-200 bg-white rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-300"
                                    >
                                        {frequencies.map(f => <option key={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">مدت مصرف</label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full border border-gray-200 bg-white rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-300"
                                    >
                                        {durations.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">دستور مصرف (اختیاری)</label>
                                <input
                                    type="text"
                                    placeholder="مثلاً بعد از غذا، با معده خالی..."
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    className="w-full border border-gray-200 bg-white rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                            <button
                                onClick={addItem}
                                disabled={!selectedDosage || !dose}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" />
                                افزودن به نسخه
                            </button>
                        </div>
                    )}
                </div>

                {/* Right column: Prescription preview */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        نسخه فعلی
                    </h3>

                    {prescriptionItems.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                            <AlertCircle className="w-12 h-12 opacity-30" />
                            <p className="text-sm">هیچ دارویی اضافه نشده</p>
                            <p className="text-xs">داروها را از بخش جستجو انتخاب کنید</p>
                        </div>
                    ) : (
                        <div className="flex-1 space-y-2 overflow-y-auto">
                            {prescriptionItems.map((item, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 relative group">
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="absolute left-2 top-2 w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    <p className="text-sm font-medium text-gray-800">{item.drugName}</p>
                                    <p className="text-xs text-gray-600 mt-1">{item.dosageForm} - {item.dose}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.frequency}</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{item.duration}</span>
                                    </div>
                                    {item.instructions && (
                                        <p className="text-xs text-gray-500 mt-1 italic">"{item.instructions}"</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <button className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                            استفاده از نسخه‌های پرتکرار
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent templates */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">نسخه‌های اخیر</h3>
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { name: 'سرماخوردگی بزرگسالان', drugs: 3, date: '۱۴۰۵/۰۲/۲۵' },
                        { name: 'دیابت نوع ۲', drugs: 2, date: '۱۴۰۵/۰۲/۲۰' },
                        { name: 'فشار خون خفیف', drugs: 2, date: '۱۴۰۵/۰۲/۱۵' },
                        { name: 'عفونت ادراری', drugs: 3, date: '۱۴۰۵/۰۲/۱۰' },
                    ].map((template, i) => (
                        <button key={i} className="flex flex-col items-start p-3 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors text-right">
                            <div className="flex items-center gap-2 mb-1">
                                <Stethoscope className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium text-gray-800">{template.name}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5" /> {template.drugs} دارو
                </span>
                                <span className="text-xs text-gray-400">{template.date}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
