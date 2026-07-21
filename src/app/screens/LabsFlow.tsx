import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/authStore";
import { AppBar } from "../components/AppBar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import { LocationMap, MASHHAD_FALLBACK } from "../components/LocationMap";
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
    Info,
    Clock3,
    Smartphone,
    Star,
    MessageCircleMore,
} from "lucide-react";

const API_BASE_URL = "http://185.222.163.113:7000";

type TestPack = {
    id: number;
    name: string;
    status: number;
    min_price: number | null;
    max_price: number | null;
};

type LabReview = {
    name: string;
    date: string;
    rating: number;
    comment: string;
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

type LabDetails = LabCenter & {
    description: string;
    phone: string;
    rating: number;
    reviewsCount: number;
    recentReviews: LabReview[];
};

const getLabDetails = (lab: LabCenter): LabDetails => {
    const seed = lab.id % 4;

    const descriptions = [
        "آزمایشگاه مجهز با امکان نمونه‌گیری در محل، ارائه پکیج‌های چکاپ کامل و ارسال آنلاین نتایج آزمایش.",
        "مرکز تشخیصی با تجهیزات به‌روز، پرسنل مجرب و پوشش گسترده آزمایش‌های تخصصی و عمومی.",
        "آزمایشگاه همکار بیمه با پذیرش نسخه الکترونیک، پاسخ‌گویی سریع و امکان پیگیری آنلاین نتایج.",
        "ارائه‌دهنده خدمات آزمایشگاهی عمومی و تخصصی با ساعت کاری منعطف و نمونه‌گیری در منزل.",
    ];

    const phones = ["۰۵۱-۳۷۶۶ ۱۱۲۲", "۰۵۱-۳۸۴۰ ۲۲۳۳", "۰۵۱-۳۷۲۱ ۴۴۵۵", "۰۵۱-۳۸۵۵ ۶۶۷۷"];

    const reviewsPool: LabReview[][] = [
        [
            { name: "مریم احمدی", date: "۱۲ تیر ۱۴۰۵", rating: 5, comment: "نمونه‌گیری در محل خیلی مرتب و سریع انجام شد." },
            { name: "علی رضایی", date: "۲۸ خرداد ۱۴۰۵", rating: 4, comment: "نتایج به‌موقع آماده شد و پشتیبانی خوبی داشتند." },
        ],
        [
            { name: "زهرا کریمی", date: "۹ تیر ۱۴۰۵", rating: 5, comment: "پرسنل حرفه‌ای بودند و هماهنگی نمونه‌گیری عالی بود." },
            { name: "رضا محمدی", date: "۲۰ خرداد ۱۴۰۵", rating: 5, comment: "از کیفیت خدمات و سرعت پاسخ‌دهی راضی بودم." },
        ],
        [
            { name: "سارا حسینی", date: "۵ تیر ۱۴۰۵", rating: 4, comment: "همه آزمایش‌ها پوشش داده شد و هزینه شفاف بود." },
            { name: "امیر جعفری", date: "۱۶ خرداد ۱۴۰۵", rating: 4, comment: "خدمات خوب بود، فقط کمی در هماهنگی تأخیر داشت." },
        ],
        [
            { name: "نرگس صادقی", date: "۲ تیر ۱۴۰۵", rating: 5, comment: "نتایج آزمایش سریع و دقیق اعلام شد." },
            { name: "حسین مرادی", date: "۱۰ خرداد ۱۴۰۵", rating: 4, comment: "محیط تمیز و کارکنان خوش‌برخورد بودند." },
        ],
    ];

    const ratings = [4.8, 4.9, 4.6, 4.7];
    const reviewsCounts = [186, 142, 97, 121];

    return {
        ...lab,
        description: descriptions[seed],
        phone: phones[seed],
        rating: ratings[seed],
        reviewsCount: reviewsCounts[seed],
        recentReviews: reviewsPool[seed],
    };
};

type UserAddress = {
    id: number;
    title: string;
    address: string;
    lat: number | null;
    lng: number | null;
    created_at: string;
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
    const [labDetails, setLabDetails] = useState<LabDetails | null>(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [addressesOpen, setAddressesOpen] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(true);


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

    const selectedAddress =
        addresses.find((item) => item.id === selectedAddressId) ?? null;

    const getAddressLabel = (item: UserAddress) => {
        return item.title || "آدرس";
    };

    const getAddressText = (item: UserAddress) => {
        return item.address || "-";
    };
    const addressDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                addressDropdownRef.current &&
                !addressDropdownRef.current.contains(event.target as Node)
            ) {
                setAddressesOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


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
        const fetchAddresses = async () => {
            try {
                setLoadingAddresses(true);

                const res = await fetch(`${API_BASE_URL}/api/user/addresses`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                });

                const json = await res.json();

                if (!res.ok || !json.success) {
                    setAddresses([]);
                    setSelectedAddressId(null);
                    return;
                }

                const list: UserAddress[] = Array.isArray(json?.data?.addresses)
                    ? json.data.addresses
                    : [];

                setAddresses(list);
                setSelectedAddressId(list[0]?.id ?? null);
            } catch {
                setAddresses([]);
                setSelectedAddressId(null);
            } finally {
                setLoadingAddresses(false);
            }
        };

        if (accessToken) {
            fetchAddresses();
        }
    }, [accessToken]);


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

        if (!selectedAddressId) {
            setApiError("لطفاً آدرس نمونه‌گیری را انتخاب کنید.");
            return false;
        }

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
                        user_address_id: selectedAddressId,
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
                        user_address_id: selectedAddressId,
                    }),
                });

                setSuccessMessage("نسخه دیجیتال شما ثبت شد و پس از بررسی توسط آزمایشگاه‌ها اطلاع‌رسانی می‌شود.");
            } else {
                const formData = new FormData();
                formData.append("request_type_id", "3");
                formData.append("visit_type", "0");
                formData.append("user_address_id", String(selectedAddressId));

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

    const openLabDetails = (lab: LabCenter) => {
        setReviewRating(0);
        setReviewText("");
        setReviewSubmitted(false);
        setLabDetails(getLabDetails(lab));
    };

    const submitReview = () => {
        if (reviewRating === 0 || reviewText.trim().length === 0) return;
        setReviewSubmitted(true);
    };

    const getServicePrice = (test: TestPack) => {
        if (test.min_price != null && test.max_price != null) {
            return Math.round((test.min_price + test.max_price) / 2);
        }
        return test.min_price ?? test.max_price ?? null;
    };

    const selectedLabServices = useMemo(() => {
        return testPacks
            .filter((test) => selectedTests.includes(test.id))
            .map((test) => ({
                id: test.id,
                name: test.name,
                price: getServicePrice(test),
            }));
    }, [testPacks, selectedTests]);

    const handleNextStep = async () => {
        if (!selectedAddressId) {
            setApiError("لطفاً آدرس نمونه‌گیری را انتخاب کنید.");
            return;
        }

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
                <div className="mb-2 flex justify-center">
                    <div ref={addressDropdownRef}  className="relative w-full max-w-md">
                        {loadingAddresses ? (
                            <div className="text-center text-sm text-slate-500">
                                در حال دریافت آدرس‌ها...
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="text-center">
                                <p className="text-sm font-bold text-amber-700">آدرسی ثبت نشده است</p>
                                <button
                                    type="button"
                                    onClick={() => navigate("/profile")}
                                    className="mt-2 text-sm font-bold text-blue-600"
                                >
                                    رفتن به پروفایل
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setAddressesOpen((prev) => !prev)}
                                    className="mx-auto flex min-h-10 items-center justify-center gap-1.5 text-center"
                                >
                                    <MapPin className="h-4 w-4 shrink-0 text-blue-600" />
                                    <span className="max-w-[220px] truncate text-sm font-bold text-slate-800">
                        {selectedAddress ? getAddressLabel(selectedAddress) : "انتخاب آدرس"}
                    </span>
                                    <ChevronDown
                                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
                                            addressesOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                <p className="mt-1 text-center text-xs text-slate-500">
                                    {selectedAddress ? getAddressText(selectedAddress) : "آدرسی انتخاب نشده است"}
                                </p>

                                {addressesOpen && (
                                    <div className="absolute left-0 right-0 top-full z-30 mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60">
                                        <div className="flex flex-col gap-2">
                                            {addresses.map((item) => {
                                                const isSelected = item.id === selectedAddressId;

                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedAddressId(item.id);
                                                            setAddressesOpen(false);
                                                        }}
                                                        className={`rounded-2xl px-3 py-3 text-center transition-all ${
                                                            isSelected
                                                                ? "bg-blue-50 text-blue-700"
                                                                : "bg-white text-slate-700 hover:bg-slate-50"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-center gap-2">
                                                            {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                                                            <span className="text-sm font-bold">
                                                {getAddressLabel(item)}
                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-xs leading-6 text-slate-500">
                                                            {getAddressText(item)}
                                                        </p>
                                                    </button>
                                                );
                                            })}

                                            <button
                                                type="button"
                                                onClick={() => navigate("/profile")}
                                                className="mt-1 text-sm font-bold text-blue-600"
                                            >
                                                مدیریت آدرس‌ها
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>


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
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                </div>
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
                                                className={`rounded-3xl border-2 p-4 shadow-sm transition-all ${
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
                                                                <Clock3 className="h-3 w-3" />
                                                                {c.work_hours || "ساعت کاری نامشخص"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                                                    <Button
                                                        type="button"
                                                        onClick={() => setSelectedLab(c.id)}
                                                        className={`h-10 rounded-full text-xs font-bold transition-all ${
                                                            isSelected
                                                                ? "bg-blue-700 text-white shadow-md shadow-blue-200 hover:bg-blue-800"
                                                                : "bg-gradient-to-l from-sky-500 to-blue-600 text-white shadow-md shadow-blue-200 hover:from-sky-600 hover:to-blue-700"
                                                        }`}
                                                    >
                                                        {isSelected ? (
                                                            <>
                                                                <CheckCircle2 className="ml-1.5 h-4 w-4" />
                                                                انتخاب شده
                                                            </>
                                                        ) : (
                                                            "انتخاب آزمایشگاه"
                                                        )}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => openLabDetails(c)}
                                                        className="h-10 rounded-full border-blue-200 bg-white text-xs font-bold text-blue-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                                                    >
                                                        <Info className="ml-1.5 h-4 w-4" />
                                                        جزئیات آزمایشگاه
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
                                    loadingAddresses ||
                                    submitting ||
                                    !selectedAddressId ||
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
                                disabled={selectedLab === null || loadingLabs || submitting || !selectedAddressId}
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

            <Dialog open={labDetails !== null} onOpenChange={(open) => !open && setLabDetails(null)}>
                <DialogContent
                    dir="rtl"
                    className="flex max-h-[90dvh] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 text-right shadow-2xl [&>button]:left-4 [&>button]:right-auto [&>button]:text-white [&>button]:opacity-100 sm:max-w-md"
                >
                    {labDetails && (
                        <>
                            <div className="bg-gradient-to-l from-sky-500 to-blue-600 px-6 py-6 text-white">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <DialogHeader className="text-right sm:text-right">
                                    <DialogTitle className="text-lg font-black leading-7 text-white">
                                        {labDetails.name}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-white/80">
                                        {labDetails.address}
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5">
                                <section className="space-y-3">
                                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                                        <Info className="h-4 w-4 text-blue-600" />
                                        اطلاعات آزمایشگاه
                                    </h3>
                                    <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3.5">
                                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-700">توضیحات</p>
                                            <p className="mt-1 text-[11px] leading-5 text-slate-500">{labDetails.description}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3.5">
                                            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-700">ساعت کاری</p>
                                                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                                    {labDetails.work_hours || "ساعت کاری نامشخص"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3.5">
                                            <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-700">تلفن تماس</p>
                                                <p className="mt-1 text-[11px] leading-5 text-slate-500" dir="ltr">
                                                    {labDetails.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                                            <MapPin className="h-3.5 w-3.5 text-blue-600" />
                                            موقعیت روی نقشه
                                        </p>
                                        <LocationMap
                                            lat={labDetails.lat ?? MASHHAD_FALLBACK.lat}
                                            lng={labDetails.lng ?? MASHHAD_FALLBACK.lng}
                                            label={labDetails.name}
                                        />
                                    </div>
                                </section>

                                <section className="space-y-3 border-t border-slate-100 pt-5">
                                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                                        <TestTube className="h-4 w-4 text-blue-600" />
                                        خدمات آزمایشی
                                    </h3>
                                    <div className="overflow-hidden rounded-2xl border border-slate-100">
                                        {selectedLabServices.length > 0 ? (
                                            selectedLabServices.map((service, index) => (
                                                <div
                                                    key={service.id}
                                                    className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                                                        index !== selectedLabServices.length - 1 ? "border-b border-slate-100" : ""
                                                    }`}
                                                >
                                                    <span className="flex min-w-0 items-center gap-2 text-xs font-bold text-slate-700">
                                                        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                                                        {service.name}
                                                    </span>
                                                    <span className="shrink-0 text-[11px] font-normal text-slate-800">
                                                        {service.price != null ? (
                                                            <>
                                                                {service.price.toLocaleString("fa-IR")}{" "}
                                                                <span className="text-[9px] text-slate-500">تومان</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400">نامشخص</span>
                                                        )}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3.5 text-xs text-slate-500">
                                                خدمت آزمایشی برای نمایش وجود ندارد.
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="space-y-3 border-t border-slate-100 pt-5">
                                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                                        <MessageCircleMore className="h-4 w-4 text-blue-600" />
                                        امتیاز کاربران
                                    </h3>
                                    <div className="flex items-center justify-between rounded-3xl bg-gradient-to-l from-amber-50 to-orange-50 p-4 ring-1 ring-amber-100">
                                        <div>
                                            <div className="flex items-end gap-1">
                                                <span className="text-3xl font-black leading-none text-slate-800">
                                                    {labDetails.rating.toLocaleString("fa-IR")}
                                                </span>
                                                <span className="pb-0.5 text-xs text-slate-400">از ۵</span>
                                            </div>
                                            <p className="mt-2 text-[10px] text-slate-500">
                                                بر اساس {labDetails.reviewsCount.toLocaleString("fa-IR")} نظر ثبت‌شده
                                            </p>
                                        </div>
                                        <div className="flex gap-1" dir="ltr">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <Star
                                                    key={index}
                                                    className={`h-4 w-4 ${
                                                        index < Math.round(labDetails.rating)
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "fill-white text-amber-200"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2.5">
                                        {labDetails.recentReviews.map((review) => (
                                            <article key={`${review.name}-${review.date}`} className="rounded-2xl bg-slate-50 p-4">
                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700">{review.name}</p>
                                                        <p className="mt-0.5 text-[10px] text-slate-400">{review.date}</p>
                                                    </div>
                                                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
                                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                        {review.rating.toLocaleString("fa-IR")}
                                                    </span>
                                                </div>
                                                <p className="text-xs leading-6 text-slate-500">{review.comment}</p>
                                            </article>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-3 border-t border-slate-100 pt-5">
                                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                                        <MessageCircleMore className="h-4 w-4 text-blue-600" />
                                        ثبت نظر
                                    </h3>
                                    {reviewSubmitted ? (
                                        <div className="flex items-center gap-3 rounded-2xl bg-blue-50 p-4 text-xs font-bold text-blue-700">
                                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                                            نظر شما با موفقیت ثبت شد.
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                                <span className="text-xs font-bold text-slate-600">امتیاز شما</span>
                                                <div className="flex gap-0.5" dir="ltr">
                                                    {Array.from({ length: 5 }).map((_, index) => {
                                                        const value = index + 1;
                                                        return (
                                                            <button
                                                                key={value}
                                                                type="button"
                                                                onClick={() => setReviewRating(value)}
                                                                aria-label={`امتیاز ${value}`}
                                                                className="rounded-full p-0.5 transition-transform hover:scale-110"
                                                            >
                                                                <Star
                                                                    className={`h-3.5 w-3.5 ${
                                                                        value <= reviewRating
                                                                            ? "fill-amber-400 text-amber-400"
                                                                            : "text-slate-300"
                                                                    }`}
                                                                />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <textarea
                                                value={reviewText}
                                                onChange={(event) => setReviewText(event.target.value)}
                                                rows={3}
                                                placeholder="نظر خود را درباره خدمات این آزمایشگاه بنویسید"
                                                className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-6 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />
                                            <Button
                                                type="button"
                                                onClick={submitReview}
                                                disabled={reviewRating === 0 || reviewText.trim().length === 0}
                                                className="h-11 w-full rounded-full bg-gradient-to-l from-sky-500 to-blue-600 text-sm font-bold text-white shadow-md shadow-blue-200 hover:from-sky-600 hover:to-blue-700"
                                            >
                                                ثبت نظر
                                            </Button>
                                        </>
                                    )}
                                </section>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
