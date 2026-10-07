import { Home, Building2, CheckCircle2 } from "lucide-react";

interface Props {
    visitType: number;
    setVisitType: (val: number) => void;
}

export function LabsStepVisitType({ visitType, setVisitType }: Props) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-1 flex-col duration-500">
            <h2 className="mb-4 text-lg font-bold text-slate-800">نحوه انجام آزمایش را انتخاب کنید</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* گزینه در منزل */}
                <div
                    onClick={() => setVisitType(1)}
                    className={`relative cursor-pointer flex flex-col items-center justify-center rounded-3xl border-2 p-6 text-center transition-all ${
                        visitType === 1 ? "border-blue-500 bg-blue-50/80 shadow-sm" : "border-slate-100 bg-white shadow-sm hover:border-blue-200"
                    }`}
                >
                    {visitType === 1 && <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-blue-600" />}
                    <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${visitType === 1 ? 'bg-blue-600' : 'bg-blue-50'}`}>
                        <Home className={`h-8 w-8 ${visitType === 1 ? 'text-white' : 'text-blue-600'}`} />
                    </div>
                    <h3 className="mb-2 text-base font-bold text-slate-800">نمونه‌گیری در منزل</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        نمونه‌گیر در زمان تعیین شده به آدرس شما مراجعه می‌کند.
                    </p>
                </div>

                {/* گزینه حضوری */}
                <div
                    onClick={() => setVisitType(0)}
                    className={`relative cursor-pointer flex flex-col items-center justify-center rounded-3xl border-2 p-6 text-center transition-all ${
                        visitType === 0 ? "border-blue-500 bg-blue-50/80 shadow-sm" : "border-slate-100 bg-white shadow-sm hover:border-blue-200"
                    }`}
                >
                    {visitType === 0 && <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-blue-600" />}
                    <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${visitType === 0 ? 'bg-blue-600' : 'bg-blue-50'}`}>
                        <Building2 className={`h-8 w-8 ${visitType === 0 ? 'text-white' : 'text-blue-600'}`} />
                    </div>
                    <h3 className="mb-2 text-base font-bold text-slate-800">مراجعه حضوری</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        خودتان شخصاً به یکی از آزمایشگاه‌های طرف قرارداد مراجعه می‌کنید.
                    </p>
                </div>
            </div>
        </div>
    );
}