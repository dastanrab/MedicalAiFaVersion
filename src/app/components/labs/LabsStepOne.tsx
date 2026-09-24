import { useRef } from "react";
import { UploadCloud, TestTube, CheckCircle2, FileText, ChevronDown, X, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { TestPack, formatPriceRange } from "./labs.types";

interface Props {
    openSection: "code" | "upload" | null;
    toggleSection: (section: "code" | "upload") => void;
    digitalCode: string;
    setDigitalCode: (val: string) => void;
    prescriptionFile: File | null;
    setPrescriptionFile: (file: File | null) => void;
    testPacks: TestPack[];
    selectedTests: number[];
    toggleTest: (id: number) => void;
    loadingTests: boolean;
}

export function LabsStepOne({ openSection, toggleSection, digitalCode, setDigitalCode, prescriptionFile, setPrescriptionFile, testPacks, selectedTests, toggleTest, loadingTests }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-1 flex-col duration-500">
            <div className="mb-3 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                <button type="button" onClick={() => toggleSection("code")} className="flex w-full items-center gap-2 px-5 py-4">
                    <FileText className="h-4 w-4 shrink-0 text-blue-600" />
                    <span className="flex-1 text-right text-sm font-bold text-slate-800">کد دیجیتال نسخه</span>
                    {digitalCode.trim().length > 0 && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${openSection === "code" ? "rotate-180" : ""}`} />
                </button>
                {openSection === "code" && (
                    <div className="animate-in fade-in slide-in-from-top-2 px-5 pb-5 duration-300">
                        <Input value={digitalCode} onChange={(e) => setDigitalCode(e.target.value)} className="h-14 rounded-2xl border border-blue-100 bg-white px-5 text-left text-lg placeholder:text-right placeholder:text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" dir="ltr" placeholder="کد ملی یا کد رهگیری بیمه" />
                        <p className="mt-2 px-2 text-xs leading-relaxed text-slate-500">در صورت داشتن نسخه الکترونیک، فقط کد را وارد کنید و نیازی به انتخاب آزمایشگاه نیست.</p>
                    </div>
                )}
            </div>

            <div className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                <button type="button" onClick={() => toggleSection("upload")} className="flex w-full items-center gap-2 px-5 py-4">
                    <UploadCloud className="h-4 w-4 shrink-0 text-blue-600" />
                    <span className="flex-1 text-right text-sm font-bold text-slate-800">آپلود عکس نسخه</span>
                    {prescriptionFile && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${openSection === "upload" ? "rotate-180" : ""}`} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,application/pdf" className="hidden" onChange={(e) => setPrescriptionFile(e.target.files?.[0] ?? null)} />
                {openSection === "upload" && (
                    <div className="animate-in fade-in slide-in-from-top-2 px-5 pb-5 duration-300">
                        {!prescriptionFile ? (
                            <div onClick={() => fileInputRef.current?.click()} className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-200 bg-white/50 shadow-sm transition-colors hover:bg-blue-50">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100"><UploadCloud className="h-6 w-6 text-blue-600" /></div>
                                <span className="text-sm font-semibold text-slate-700">آپلود تصویر یا PDF نسخه</span>
                                <span className="mt-1 text-xs text-slate-400">حداکثر ۵ مگابایت</span>
                            </div>
                        ) : (
                            <div className="relative flex h-40 flex-col items-center justify-center rounded-3xl border-2 border-blue-200 bg-white px-6 shadow-sm">
                                <button onClick={() => setPrescriptionFile(null)} className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"><X className="h-4 w-4" /></button>
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100"><CheckCircle2 className="h-6 w-6 text-blue-600" /></div>
                                <span className="max-w-full truncate text-sm font-semibold text-slate-700">{prescriptionFile.name}</span>
                                <span className="mt-1 text-xs text-blue-600">فایل با موفقیت انتخاب شد</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800"><TestTube className="h-4 w-4 text-blue-600" />آزمایش‌های مورد نیاز</h2>

            {loadingTests ? (
                <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
            ) : (
                <div className="mb-6 grid grid-cols-2 gap-3">
                    {testPacks.map((test) => {
                        const isSelected = selectedTests.includes(test.id);
                        return (
                            <div key={test.id} onClick={() => toggleTest(test.id)} className={`flex h-full cursor-pointer flex-col rounded-3xl border-2 p-4 transition-all ${isSelected ? "border-blue-500 bg-blue-50/80 shadow-sm" : "border-slate-100 bg-white shadow-sm hover:border-blue-200"}`}>
                                <div className="mb-3 flex items-start justify-between">
                                    <div className={`rounded-2xl p-2.5 ${isSelected ? "bg-blue-600" : "bg-blue-50"}`}><TestTube className={`h-5 w-5 ${isSelected ? "text-white" : "text-blue-600"}`} /></div>
                                    {isSelected ? <CheckCircle2 className="h-5 w-5 text-blue-600" /> : <div className="h-5 w-5 rounded-full border-2 border-slate-200" />}
                                </div>
                                <h3 className="mb-1 text-sm font-bold text-slate-800">{test.name}</h3>
                                <p className="mb-1 text-[11px] font-semibold text-blue-600">بازه قیمت: {formatPriceRange(test.min_price, test.max_price)}</p>
                                <p className="flex-1 text-[10px] text-slate-400">کد پکیج: {test.id}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}