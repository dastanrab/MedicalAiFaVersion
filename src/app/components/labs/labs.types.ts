import { FileText, Building2 } from "lucide-react";

export type TestPack = {
    id: number;
    name: string;
    status: number;
    min_price: number | null;
    max_price: number | null;
};

export type LabReview = {
    name: string;
    date: string;
    rating: number;
    comment: string;
};

export type LabCenter = {
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

export type LabDetails = LabCenter & {
    description: string;
    phone: string;
    rating: number;
    reviewsCount: number;
    recentReviews: LabReview[];
};

export type RequestType = 1 | 2 | 3;

export type LabsDraft = {
    step: number;
    digitalCode: string;
    openSection: "code" | "upload" | null;
    selectedTests: number[];
    selectedLab: number | null;
    selectedAddressId: number | null;
};

export const LABS_DRAFT_KEY = "medira:labs-flow-draft";

export const stepsData = [
    { id: 1, title: "نسخه و آزمایش‌ها", icon: FileText },
    { id: 2, title: "انتخاب آزمایشگاه", icon: Building2 },
];

export const formatPriceRange = (minPrice: number | null, maxPrice: number | null) => {
    if (minPrice == null || maxPrice == null) return "قیمت نامشخص";
    if (minPrice === maxPrice) return `${minPrice.toLocaleString("fa-IR")} تومان`;
    return `${minPrice.toLocaleString("fa-IR")} تا ${maxPrice.toLocaleString("fa-IR")} تومان`;
};

export const getServicePrice = (test: TestPack) => {
    if (test.min_price != null && test.max_price != null) {
        return Math.round((test.min_price + test.max_price) / 2);
    }
    return test.min_price ?? test.max_price ?? null;
};

export function loadLabsDraft(): LabsDraft | null {
    try {
        const raw = sessionStorage.getItem(LABS_DRAFT_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<LabsDraft>;
        return {
            step: parsed.step === 2 ? 2 : 1,
            digitalCode: typeof parsed.digitalCode === "string" ? parsed.digitalCode : "",
            openSection: parsed.openSection === "code" || parsed.openSection === "upload" ? parsed.openSection : null,
            selectedTests: Array.isArray(parsed.selectedTests) ? parsed.selectedTests.filter((id) => typeof id === "number") : [],
            selectedLab: typeof parsed.selectedLab === "number" ? parsed.selectedLab : null,
            selectedAddressId: typeof parsed.selectedAddressId === "number" ? parsed.selectedAddressId : null,
        };
    } catch {
        return null;
    }
}

export function clearLabsDraft() {
    sessionStorage.removeItem(LABS_DRAFT_KEY);
}

export const getLabDetails = (lab: LabCenter): LabDetails => {
    const seed = lab.id % 4;
    const descriptions = [
        "آزمایشگاه مجهز با امکان نمونه‌گیری در محل، ارائه پکیج‌های چکاپ کامل...",
        "مرکز تشخیصی با تجهیزات به‌روز، پرسنل مجرب و پوشش گسترده...",
        "آزمایشگاه همکار بیمه با پذیرش نسخه الکترونیک، پاسخ‌گویی سریع...",
        "ارائه‌دهنده خدمات آزمایشگاهی عمومی و تخصصی با ساعت کاری منعطف...",
    ];
    const phones = ["۰۵۱-۳۷۶۶ ۱۱۲۲", "۰۵۱-۳۸۴۰ ۲۲۳۳", "۰۵۱-۳۷۲۱ ۴۴۵۵", "۰۵۱-۳۸۵۵ ۶۶۷۷"];
    const reviewsPool: LabReview[][] = [
        [{ name: "مریم احمدی", date: "۱۲ تیر ۱۴۰۵", rating: 5, comment: "عالی بود." }],
        [{ name: "زهرا کریمی", date: "۹ تیر ۱۴۰۵", rating: 5, comment: "پرسنل حرفه‌ای بودند." }],
        [{ name: "سارا حسینی", date: "۵ تیر ۱۴۰۵", rating: 4, comment: "هزینه شفاف بود." }],
        [{ name: "نرگس صادقی", date: "۲ تیر ۱۴۰۵", rating: 5, comment: "سریع و دقیق." }],
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