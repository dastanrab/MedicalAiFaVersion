import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/authStore";
import { AppBar } from "../components/AppBar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    UploadCloud,
    TestTube,
    CheckCircle2,
    ArrowLeft,
    FileText,
    Check,
    PartyPopper,
    Building2,
    MapPin,
    X,
    ChevronDown,
    Loader2,
} from "lucide-react";

const API_BASE_URL = "http://185.222.163.113:7000";

type TestPack = {
    id: number;
    name: string;
    status: number;
    min_price: number | null;
    max_price: number | null;
};

type LabCenter = {
    id: number;
    name: string;
    slug: string;
    address: string;
    lat: number | null;
    lng: number | null;
    work_hours: string | null;
    image: string | null;
    total_price: number;
};

type RequestType = 1 | 2 | 3;

const stepsData = [
    { id: 1, title: "نسخه و آزمایش‌ها", icon: FileText },
    { id: 2, title: "انتخاب آزمایشگاه", icon: Building2 },
];

export function LabsFlow() {
    const navigate = useNavigate();
    const { accessToken } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [digitalCode, setDigitalCode] = useState("");
    const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
    const [openSection, setOpenSection] = useState<"code" | "upload" | null>(null);

    const [testPacks, setTestPacks] = useState<TestPack[]>([]);
    const [selectedTests, setSelectedTests] = useState<number[]>([]);
    const [labs, setLabs] = useState<LabCenter[]>([]);
    const [selectedLab, setSelectedLab] = useState<number | null>(null);

    const [loadingTests, setLoadingTests] = useState(true);
    const [loadingLabs, setLoadingLabs] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("درخواست شما با موفقیت ثبت شد.");

    const formatPriceRange = (minPrice: number | null, maxPrice: number | null) => {
        if (minPrice == null || maxPrice == null) {
            return "قیمت نامشخص";
        }

        if (minPrice === maxPrice) {
            return `${minPrice.toLocaleString("fa-IR")} تومان`;
        }

        return `${minPrice.toLocaleString("fa-IR")} تا ${maxPrice.toLocaleString("fa-IR")} تومان`;
    };

    const getSelectedMode = (): RequestType | null => {
        const hasTests = selectedTests.length > 0;
        const hasCode = digitalCode.trim().length > 0;
        const hasFile = !!prescriptionFile;

        const activeModes = [hasTests, hasCode, hasFile].filter(Boolean).length;

        if (activeModes === 0) {
            return null;
        }

        if (activeModes > 1) {
            return null;
        }

        if (hasTests) {
            return 1;
        }

        if (hasCode) {
            return 2;
        }

        if (hasFile) {
            return 3;
        }

        return null;
    };

    const isMixedSelection = useMemo(() => {
        const hasTests = selectedTests.length > 0;
        const hasCode = digitalCode.trim().length > 0;
        const hasFile = !!prescriptionFile;

        return [hasTests, hasCode, hasFile].filter(Boolean).length > 1;
    }, [selectedTests, digitalCode, prescriptionFile]);

    useEffect(() => {
        const fetchTestPacks = async () => {
            try {
                setLoadingTests(true);
                setApiError(null);

                const res = await fetch(`${API_BASE_URL}/api/user/labs/test-packs`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                });

                const json = await res.json();

                if (json.success) {
                    setTestPacks(json.data || []);
                } else {
                    setApiError(json.message || "خطا در دریافت لیست آزمایش‌ها");
                }
            } catch {
                setApiError("خطا در ارتباط با سرور برای دریافت آزمایش‌ها");
            } finally {
                setLoadingTests(false);
            }
        };

        if (accessToken) {
            fetchTestPacks();
        }
    }, [accessToken]);

    const fetchLabs = async () => {
        try {
            setLoadingLabs(true);
            setApiError(null);
            setSelectedLab(null);
            setLabs([]);

            const res = await fetch(`${API_BASE_URL}/api/user/labs/search-centers`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    test_pack_ids: selectedTests,
                }),
            });

            const json = await res.json();

            if (json.success) {
                setLabs(json.data || []);
                return true;
            }

            setApiError(json.message || "خطا در دریافت لیست آزمایشگاه‌ها");
            return false;
        } catch {
            setApiError("خطا در ارتباط با سرور برای جستجوی آزمایشگاه‌ها");
            return false;
        } finally {
            setLoadingLabs(false);
        }
    };

    const submitLabRequest = async () => {
        const requestType = getSelectedMode();

        if (!requestType) {
            if (isMixedSelection) {
                setApiError("فقط یکی از حالت‌های انتخاب آزمایش، کد دیجیتال یا آپلود نسخه را استفاده کنید.");
            } else {
                setApiError("لطفاً یک روش ثبت درخواست را انتخاب کنید.");
            }
            return false;
        }

        try {
            setSubmitting(true);
            setApiError(null);

            let res: Response;

            if (requestType === 1) {
                if (!selectedLab) {
                    setApiError("لطفاً آزمایشگاه مورد نظر را انتخاب کنید.");
                    return false;
                }

                res = await fetch(`${API_BASE_URL}/api/user/labs/requests`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        request_type_id: 1,
                        visit_type: 0,
                        lab_id: selectedLab,
                        test_pack_ids: selectedTests,
                    }),
                });

                setSuccessMessage(
                    `درخواست آزمایش شما برای آزمایشگاه ${selectedLabInfo?.name || ""} ثبت شد.`
                );
            } else if (requestType === 2) {
                res = await fetch(`${API_BASE_URL}/api/user/labs/requests`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        request_type_id: 2,
                        visit_type: 0,
                        digital_code: digitalCode.trim(),
                    }),
                });

                setSuccessMessage("نسخه دیجیتال شما ثبت شد و پس از بررسی توسط آزمایشگاه‌ها اطلاع‌رسانی می‌شود.");
            } else {
                const formData = new FormData();
                formData.append("request_type_id", "3");
                formData.append("visit_type", "0");

                if (prescriptionFile) {
                    formData.append("files[]", prescriptionFile);
                }

                res = await fetch(`${API_BASE_URL}/api/user/labs/requests`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: formData,
                });

                setSuccessMessage("فایل نسخه شما ثبت شد و پس از بررسی توسط آزمایشگاه‌ها اطلاع‌رسانی می‌شود.");
            }

            const json = await res.json();

            if (!res.ok || !json.success) {
                const validationErrors = json?.errors
                    ? Object.values(json.errors).flat().join(" - ")
                    : null;

                setApiError(validationErrors || json?.message || "خطا در ثبت درخواست");
                return false;
            }

            setSubmitted(true);
            return true;
        } catch {
            setApiError("خطا در ارتباط با سرور برای ثبت درخواست");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const toggleSection = (section: "code" | "upload") => {
        setOpenSection((prev) => (prev === section ? null : section));
    };

    const toggleTest = (id: number) => {
        setSelectedTests((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const handleNextStep = async () => {
        if (isMixedSelection) {
            setApiError("فقط یکی از حالت‌های انتخاب آزمایش، کد دیجیتال یا آپلود نسخه را استفاده کنید.");
            return;
        }

        const requestType = getSelectedMode();

        if (!requestType) {
            setApiError("لطفاً حداقل یک آزمایش انتخاب کنید یا کد/فایل نسخه را وارد کنید.");
            return;
        }

        if (requestType === 1) {
            const ok = await fetchLabs();
            if (ok) {
                setStep(2);
            }
            return;
        }

        await submitLabRequest();
    };

    const selectedLabInfo = labs.find((l) => l.id === selectedLab) ?? null;

    if (submitted) {
        return (
            <div className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white text-right font-[YekanBakhFaNum]" dir="rtl">
                <AppBar backTo="/services" />
                <div className="flex min-h-[calc(100%-1px)] flex-col items-center justify-center px-6 pt-24">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-blue-200">
                        <PartyPopper className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="mb-2 text-xl font-black text-slate-800">درخواست شما ثبت شد</h1>
                    <p className="mb-8 max-w-sm text-center text-sm leading-relaxed text-slate-500">
                        {successMessage}
                    </p>
                    <Button
                        className="h-12 rounded-2xl bg-blue-600 px-8 text-white hover:bg-blue-700"
                        onClick={() => navigate("/services")}
                    >
                        بازگشت به خدمات
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white pb-24 text-right font-[YekanBakhFaNum]" dir="rtl">
            <AppBar backTo="/services" />

            <div className="relative z-10 px-5 pb-4 pt-24 text-right sm:px-6">
                <div className="mb-8 shrink-0">
                    <div className="mb-6 flex items-center gap-3 rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 p-4 shadow-lg shadow-blue-200">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                            <TestTube className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-lg font-black tracking-tight text-white">درخواست آزمایش</h1>
                            <p className="mt-0.5 text-[11px] text-white/80">
                                مرحله {step} از {stepsData.length} · {stepsData[step - 1].title}
                            </p>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-black text-white ring-1 ring-white/25">
                            {step}/{stepsData.length}
                        </div>
                    </div>

                    <div className="relative flex items-center justify-between px-2">
                        <div className="absolute left-6 right-6 top-5 -z-10 h-1 overflow-hidden rounded-full bg-blue-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-l from-sky-500 to-blue-600 transition-all duration-500 ease-out"
                                style={{ width: `${((step - 1) / (stepsData.length - 1)) * 100}%`, marginRight: "auto" }}
                            />
                        </div>

                        {stepsData.map((s) => {
                            const isCompleted = step > s.id;
                            const isCurrent = step === s.id;
                            const StepIcon = isCompleted ? Check : s.icon;

                            return (
                                <div key={s.id} className="z-10 flex flex-col items-center gap-2 bg-transparent">
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                                            isCompleted
                                                ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-200"
                                                : isCurrent
                                                    ? "scale-110 border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-white"
                                                    : "border-blue-200 bg-white text-blue-300 ring-4 ring-white"
                                        }`}
                                    >
                                        <StepIcon className={`h-5 w-5 ${isCompleted ? "animate-in zoom-in duration-300" : ""}`} />
                                    </div>
                                    <span
                                        className={`text-[11px] font-bold transition-colors duration-300 ${
                                            isCompleted
                                                ? "text-emerald-600"
                                                : isCurrent
                                                    ? "text-blue-700"
                                                    : "text-slate-400"
                                        }`}
                                    >
                                        {s.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {apiError && (
                    <div className="mb-4 flex items-center justify-between rounded-2xl bg-red-50 p-3 text-sm text-red-600">
                        <span>{apiError}</span>
                        <button onClick={() => setApiError(null)}>
                            <X className="h-4 w-4 text-red-400" />
                        </button>
                    </div>
                )}

                {isMixedSelection && (
                    <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-700">
                        فقط یکی از روش‌های ثبت درخواست را انتخاب کنید: انتخاب آزمایش، کد دیجیتال یا فایل نسخه.
                    </div>
                )}

                <div className="flex flex-1 flex-col pb-4">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-1 flex-col duration-500">
                            <div className="mb-3 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => toggleSection("code")}
                                    className="flex w-full items-center gap-2 px-5 py-4"
                                >
                                    <FileText className="h-4 w-4 shrink-0 text-blue-600" />
                                    <span className="flex-1 text-right text-sm font-bold text-slate-800">کد دیجیتال نسخه</span>
                                    {digitalCode.trim().length > 0 && (
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                    )}
                                    <ChevronDown
                                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
                                            openSection === "code" ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                                {openSection === "code" && (
                                    <div className="animate-in fade-in slide-in-from-top-2 px-5 pb-5 duration-300">
                                        <Input
                                            value={digitalCode}
                                            onChange={(e) => setDigitalCode(e.target.value)}
                                            className="h-14 rounded-2xl border border-blue-100 bg-white px-5 text-left text-lg placeholder:text-right placeholder:text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            dir="ltr"
                                            placeholder="کد ملی یا کد رهگیری بیمه"
                                        />
                                        <p className="mt-2 px-2 text-xs leading-relaxed text-slate-500">
                                            در صورت داشتن نسخه الکترونیک، فقط کد را وارد کنید و نیازی به انتخاب آزمایشگاه نیست.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => toggleSection("upload")}
                                    className="flex w-full items-center gap-2 px-5 py-4"
                                >
                                    <UploadCloud className="h-4 w-4 shrink-0 text-blue-600" />
                                    <span className="flex-1 text-right text-sm font-bold text-slate-800">آپلود عکس نسخه</span>
                                    {prescriptionFile && (
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                    )}
                                    <ChevronDown
                                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
                                            openSection === "upload" ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,application/pdf"
                                    className="hidden"
                                    onChange={(e) => setPrescriptionFile(e.target.files?.[0] ?? null)}
                                />
                                {openSection === "upload" && (
                                    <div className="animate-in fade-in slide-in-from-top-2 px-5 pb-5 duration-300">
                                        {!prescriptionFile ? (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-200 bg-white/50 shadow-sm transition-colors hover:bg-blue-50"
                                            >
                                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                                    <UploadCloud className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700">آپلود تصویر یا PDF نسخه</span>
                                                <span className="mt-1 text-xs text-slate-400">حداکثر ۵ مگابایت</span>
                                            </div>
                                        ) : (
                                            <div className="relative flex h-40 flex-col items-center justify-center rounded-3xl border-2 border-blue-200 bg-white px-6 shadow-sm">
                                                <button
                                                    onClick={() => setPrescriptionFile(null)}
                                                    className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <span className="max-w-full truncate text-sm font-semibold text-slate-700">{prescriptionFile.name}</span>
                                                <span className="mt-1 text-xs text-blue-600">فایل با موفقیت انتخاب شد</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
                                <TestTube className="h-4 w-4 text-blue-600" />
                                آزمایش‌های مورد نیاز
                            </h2>

                            {loadingTests ? (
                                <div className="py-8 text-center text-sm text-slate-500">در حال بارگذاری آزمایش‌ها...</div>
                            ) : (
                                <div className="mb-6 grid grid-cols-2 gap-3">
                                    {testPacks.map((test) => {
                                        const isSelected = selectedTests.includes(test.id);

                                        return (
                                            <div
                                                key={test.id}
                                                onClick={() => toggleTest(test.id)}
                                                className={`flex h-full cursor-pointer flex-col rounded-3xl border-2 p-4 transition-all ${
                                                    isSelected
                                                        ? "border-blue-500 bg-blue-50/80 shadow-sm"
                                                        : "border-slate-100 bg-white shadow-sm hover:border-blue-200"
                                                }`}
                                            >
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div className={`rounded-2xl p-2.5 ${isSelected ? "bg-blue-600" : "bg-blue-50"}`}>
                                                        <TestTube className={`h-5 w-5 ${isSelected ? "text-white" : "text-blue-600"}`} />
                                                    </div>
                                                    {isSelected ? (
                                                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                                    ) : (
                                                        <div className="h-5 w-5 rounded-full border-2 border-slate-200" />
                                                    )}
                                                </div>

                                                <h3 className="mb-1 text-sm font-bold text-slate-800">{test.name}</h3>
                                                <p className="mb-1 text-[11px] font-semibold text-blue-600">
                                                    بازه قیمت: {formatPriceRange(test.min_price, test.max_price)}
                                                </p>
                                                <p className="flex-1 text-[10px] text-slate-400">کد پکیج: {test.id}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-1 flex-col duration-500">
                            <h2 className="mb-1 text-lg font-bold text-slate-800">آزمایشگاه مورد نظر را انتخاب کنید</h2>
                            <p className="mb-4 text-xs text-slate-500">لیست آزمایشگاه‌های فعال همکار سیستم</p>

                            {loadingLabs ? (
                                <div className="py-8 text-center text-sm text-slate-500">در حال جستجوی آزمایشگاه‌های مناسب...</div>
                            ) : labs.length === 0 ? (
                                <div className="py-8 text-center text-sm text-slate-500">
                                    آزمایشگاهی با پوشش تمامی آزمایش‌های انتخابی شما یافت نشد.
                                </div>
                            ) : (
                                <div className="mb-6 flex flex-col gap-3">
                                    {labs.map((c) => {
                                        const isSelected = selectedLab === c.id;

                                        return (
                                            <div
                                                key={c.id}
                                                onClick={() => setSelectedLab(c.id)}
                                                className={`cursor-pointer rounded-3xl border-2 p-4 shadow-sm transition-all ${
                                                    isSelected ? "border-blue-500 bg-blue-50/80" : "border-slate-100 bg-white hover:border-blue-200"
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <img
                                                        src={c.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=2563eb&color=fff`}
                                                        alt={c.name}
                                                        className="h-11 w-11 shrink-0 rounded-2xl border object-cover"
                                                        onError={(e: any) => {
                                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=2563eb&color=fff`;
                                                        }}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h3 className="truncate text-sm font-bold text-slate-800">{c.name}</h3>
                                                            <div
                                                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                                                    isSelected ? "border-blue-600 bg-blue-600" : "border-slate-200"
                                                                }`}
                                                            >
                                                                {isSelected && <Check className="h-3 w-3 text-white" />}
                                                            </div>
                                                        </div>
                                                        <p className="mt-1 truncate text-[11px] text-slate-500">{c.address}</p>
                                                        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {c.work_hours || "ساعت کاری نامشخص"}
                                                            </span>
                                                        </div>
                                                    </div>
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
                                            <span className="text-2xl font-black tracking-tight text-blue-600">
                                                {selectedLabInfo.total_price.toLocaleString("fa-IR")}
                                            </span>
                                            <span className="mr-1 text-xs text-slate-500">تومان</span>
                                        </div>
                                    </div>
                                    <p className="pt-1 text-xs leading-relaxed text-slate-500">
                                        زمان مراجعه نمونه‌گیر پس از تأیید درخواست توسط آزمایشگاه با شما هماهنگ می‌شود.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 z-10 mt-auto bg-gradient-to-t from-white via-white/95 to-transparent pb-2 pt-6">
                    <div className="flex items-center justify-center gap-3">
                        {step > 1 && (
                            <Button
                                variant="outline"
                                className="h-12 w-12 shrink-0 rounded-full border-blue-100 bg-white p-0 text-blue-600 shadow-md shadow-blue-100/80 hover:bg-blue-50 hover:text-blue-700"
                                onClick={() => setStep(step - 1)}
                                disabled={submitting}
                            >
                                <ArrowLeft className="h-5 w-5 rotate-180" />
                            </Button>
                        )}

                        {step === 1 && (
                            <Button
                                className="h-12 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-10 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40"
                                disabled={
                                    loadingTests ||
                                    submitting ||
                                    (!selectedTests.length && digitalCode.trim().length === 0 && !prescriptionFile)
                                }
                                onClick={handleNextStep}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                        در حال ثبت...
                                    </>
                                ) : getSelectedMode() === 1 ? (
                                    <>
                                        مرحله بعد
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                    </>
                                ) : (
                                    "ثبت درخواست"
                                )}
                            </Button>
                        )}

                        {step === 2 && (
                            <Button
                                className="h-12 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-10 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40"
                                disabled={selectedLab === null || loadingLabs || submitting}
                                onClick={submitLabRequest}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                        در حال ثبت...
                                    </>
                                ) : (
                                    "ثبت نهایی درخواست"
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
