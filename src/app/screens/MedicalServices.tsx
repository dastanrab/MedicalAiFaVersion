import { useNavigate } from "react-router";
import { AppBar } from "../components/AppBar";
import { Card } from "../components/ui/card";
import { ChevronLeft } from "lucide-react";

const services = [
    { title: "آزمایشگاه", emoji: "🧪", path: "/services/labs" },
    { title: "داروخانه", emoji: "💊", path: "/services/pharmacy" },
    { title: "رادیولوژی", emoji: "🩻", path: "/services/radiology" },
    { title: "پرستار در منزل", emoji: "🧑‍⚕️", path: "/services/nurse-home" },
];

const topLabs = [
    { name: "آزمایشگاه پاتوبیولوژی سینا", city: "مشهد" },
    { name: "آزمایشگاه تخصصی نیکان", city: "تهران" },
    { name: "آزمایشگاه رازی", city: "اصفهان" },
];

const pharmacies = [
    { name: "داروخانه شبانه روزی مرکزی", city: "مشهد" },
    { name: "داروخانه دکتر عبیدی", city: "تهران" },
    { name: "داروخانه بزرگ اصفهان", city: "اصفهان" },
];

export function MedicalServices() {
    const navigate = useNavigate();

    return (
        <div className="h-full bg-gradient-to-b from-blue-50 to-white overflow-y-auto pb-24 text-right font-[YekanBakhFaNum]">
        <AppBar />

        <div className="px-6 pt-24 py-8">

            {/* header */}
            <div className="mb-8 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 p-5 shadow-[0_8px_32px_rgba(37,99,235,0.28)] text-white">
    <h1 className="text-xl font-bold">خدمات درمانی</h1>
    <p className="text-sm text-blue-100 mt-1">
        دسترسی سریع به خدمات پزشکی
    </p>
    </div>

    {/* services grid */}
    <div className="grid grid-cols-2 gap-4 mb-10">
        {services.map((service) => (
                <Card
                    key={service.title}
            onClick={() => navigate(service.path)}
    className="cursor-pointer rounded-2xl border border-gray-100 p-5 text-center shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition"
    >
    <div className="text-3xl mb-2">{service.emoji}</div>
        <p className="text-sm font-semibold text-gray-800">
        {service.title}
        </p>
        </Card>
))}
    </div>

    {/* top labs */}
    <div className="mb-10">
    <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-bold text-gray-900">آزمایشگاه‌های برتر</h2>
    </div>

    <div className="flex gap-4 overflow-x-auto pb-2">
        {topLabs.map((lab) => (
                <Card
                    key={lab.name}
            className="min-w-[220px] rounded-2xl border border-gray-100 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            >
            <div className="text-2xl mb-2">🧪</div>
    <h3 className="font-semibold text-gray-900 text-sm">
        {lab.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{lab.city}</p>

        <button className="mt-3 text-xs text-blue-600 flex items-center gap-1">
        مشاهده
        <ChevronLeft className="w-3 h-3" />
        </button>
        </Card>
))}
    </div>
    </div>

    {/* pharmacies */}
    <div className="mb-10">
    <h2 className="text-lg font-bold text-gray-900 mb-4">داروخانه‌ها</h2>

        <div className="flex gap-4 overflow-x-auto pb-2">
        {pharmacies.map((pharmacy) => (
                <Card
                    key={pharmacy.name}
            className="min-w-[220px] rounded-2xl border border-gray-100 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            >
            <div className="text-2xl mb-2">💊</div>
    <h3 className="font-semibold text-gray-900 text-sm">
        {pharmacy.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{pharmacy.city}</p>

        <button className="mt-3 text-xs text-blue-600 flex items-center gap-1">
        مشاهده
        <ChevronLeft className="w-3 h-3" />
        </button>
        </Card>
))}
    </div>
    </div>

    </div>
    </div>
);
}
