import { Check, CheckCircle2, Clock3, Info } from "lucide-react";
import { Button } from "../ui/button";
import { LabCenter } from "./labs.types";

interface Props {
    labs: LabCenter[];
    loadingLabs: boolean;
    selectedLab: number | null;
    setSelectedLab: (id: number) => void;
    openLabDetails: (lab: LabCenter) => void;
    selectedTests: number[];
}

export function LabsStepTwo({ labs, loadingLabs, selectedLab, setSelectedLab, openLabDetails, selectedTests }: Props) {
    const selectedLabInfo = labs.find((l) => l.id === selectedLab) ?? null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-1 flex-col duration-500">
            <h2 className="mb-1 text-lg font-bold text-slate-800">آزمایشگاه مورد نظر را انتخاب کنید</h2>
            <p className="mb-4 text-xs text-slate-500">لیست آزمایشگاه‌های فعال همکار سیستم</p>

            {loadingLabs ? (
                <div className="py-8 text-center text-sm text-slate-500">در حال جستجوی آزمایشگاه‌های مناسب...</div>
            ) : labs.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">آزمایشگاهی با پوشش تمامی آزمایش‌های انتخابی شما یافت نشد.</div>
            ) : (
                <div className="mb-6 flex flex-col gap-3">
                    {labs.map((c) => {
                        const isSelected = selectedLab === c.id;
                        return (
                            <div key={c.id} className={`rounded-3xl border-2 p-4 shadow-sm transition-all ${isSelected ? "border-blue-500 bg-blue-50/80" : "border-slate-100 bg-white hover:border-blue-200"}`}>
                                <div className="flex items-start gap-3">
                                    <img src={c.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=2563eb&color=fff`} alt={c.name} className="h-11 w-11 shrink-0 rounded-2xl border object-cover" />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="truncate text-sm font-bold text-slate-800">{c.name}</h3>
                                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? "border-blue-600 bg-blue-600" : "border-slate-200"}`}>
                                                {isSelected && <Check className="h-3 w-3 text-white" />}
                                            </div>
                                        </div>
                                        <p className="mt-1 truncate text-[11px] text-slate-500">{c.address}</p>
                                        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                                            <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" />{c.work_hours || "ساعت کاری نامشخص"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                                    <Button type="button" onClick={() => setSelectedLab(c.id)} className={`h-10 rounded-full text-xs font-bold transition-all ${isSelected ? "bg-blue-700 text-white shadow-md shadow-blue-200 hover:bg-blue-800" : "bg-gradient-to-l from-sky-500 to-blue-600 text-white shadow-md shadow-blue-200 hover:from-sky-600 hover:to-blue-700"}`}>
                                        {isSelected ? <><CheckCircle2 className="ml-1.5 h-4 w-4" />انتخاب شده</> : "انتخاب آزمایشگاه"}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => openLabDetails(c)} className="h-10 rounded-full border-blue-200 bg-white text-xs font-bold text-blue-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800">
                                        <Info className="ml-1.5 h-4 w-4" />جزئیات آزمایشگاه
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedLabInfo && (
                <div className="space-y-4 rounded-3xl border border-blue-50 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">تعداد آزمایش‌ها</span>
                        <span className="font-bold text-slate-800">{selectedTests.length} مورد</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-sm">
                        <span className="text-slate-500">هزینه نمونه‌گیری در محل</span>
                        <span className="font-bold text-emerald-600">رایگان</span>
                    </div>
                    <div className="flex items-end justify-between pt-2">
                        <span className="text-sm font-bold text-slate-800">مبلغ قابل پرداخت</span>
                        <div className="text-left">
                            <span className="text-2xl font-black tracking-tight text-blue-600">{selectedLabInfo.total_price.toLocaleString("fa-IR")}</span>
                            <span className="mr-1 text-xs text-slate-500">تومان</span>
                        </div>
                    </div>
                    <p className="pt-1 text-xs leading-relaxed text-slate-500">زمان مراجعه نمونه‌گیر پس از تأیید درخواست توسط آزمایشگاه با شما هماهنگ می‌شود.</p>
                </div>
            )}
        </div>
    );
}