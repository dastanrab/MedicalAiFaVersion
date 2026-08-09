// src/pages/DoctorCalendar.tsx
import { useMemo, useState } from 'react';
import { AppBar } from '../components/AppBar';
import { Card } from '../components/ui/card';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    Users,
    CalendarCheck,
} from 'lucide-react';

type SlotStatus = 'available' | 'booked';

type SlotRow = {
    id: number;
    day: number; // شماره روز در ماه خرداد
    start_time: string;
    end_time: string;
    status: SlotStatus;
    patient_name?: string;
};

// داده‌های تستی برای چند روز مختلف در خرداد
const demoSlots: SlotRow[] = [
    // روز ۲
    { id: 1, day: 2, start_time: '10:00', end_time: '10:30', status: 'booked', patient_name: 'رضا علوی' },
    { id: 2, day: 2, start_time: '10:30', end_time: '11:00', status: 'booked', patient_name: 'مریم حسینی' },
    // روز ۹
    { id: 3, day: 9, start_time: '16:00', end_time: '16:30', status: 'booked', patient_name: 'علی محمدی' },
    { id: 4, day: 9, start_time: '16:30', end_time: '17:00', status: 'available' },
    { id: 5, day: 9, start_time: '17:00', end_time: '17:30', status: 'booked', patient_name: 'سارا احمدی' },
    // روز ۱۵
    { id: 6, day: 15, start_time: '09:00', end_time: '09:30', status: 'available' },
    { id: 7, day: 15, start_time: '09:30', end_time: '10:00', status: 'available' },
    // روز ۲۰
    { id: 8, day: 20, start_time: '18:00', end_time: '18:30', status: 'booked', patient_name: 'حسین کریمی' },
];

const WEEKDAYS = [
    { name: 'شنبه', color: 'text-blue-800' },
    { name: 'یکشنبه', color: 'text-blue-800' },
    { name: 'دوشنبه', color: 'text-blue-800' },
    { name: 'سه شنبه', color: 'text-blue-800' },
    { name: 'چهارشنبه', color: 'text-blue-800' },
    { name: 'پنجشنبه', color: 'text-blue-800' },
    { name: 'جمعه', color: 'text-orange-600' }
];

// تابع تبدیل اعداد به فارسی
const toFa = (num: number | string) => num.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

// روزهای تعطیل خرداد
const holidays = [1, 6, 8, 14, 15, 22, 29];

export function DoctorCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1));
    const [selectedDay, setSelectedDay] = useState<number | null>(9); // روز پیش‌فرض انتخاب شده

    const startOffset = 6; // شروع خرداد از جمعه

    const getDayData = (dayNum: number) => {
        const daySlots = demoSlots.filter(s => s.day === dayNum);
        return {
            booked: daySlots.filter(s => s.status === 'booked').length,
            available: daySlots.filter(s => s.status === 'available').length,
            slots: daySlots
        };
    };

    const selectedDayInfo = useMemo(() => {
        if (!selectedDay) return null;
        return getDayData(selectedDay);
    }, [selectedDay]);

    return (
        <div className="h-full overflow-x-hidden overflow-y-auto bg-white pb-24 font-[YekanBakhFaNum]" dir="rtl">
            <AppBar />

            <div className="px-4 pt-24 py-6 max-w-md mx-auto">

                {/* Header (Blue Theme) */}
                <div className="mb-6 flex items-center justify-between rounded-xl bg-blue-600 px-4 py-4 text-white shadow-sm">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="flex items-center gap-1 text-md font-medium hover:opacity-80 transition">
                        <ChevronRight size={20} /> ماه بعد
                    </button>
                    <div className="text-xl font-bold">
                        خرداد ۱۴۰۵
                    </div>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="flex items-center gap-1 text-md font-medium hover:opacity-80 transition">
                        ماه قبل <ChevronLeft size={20} />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="mb-8">
                    {/* روزهای هفته */}
                    <div className="mb-4 grid grid-cols-7 text-center text-[13px] font-bold">
                        {WEEKDAYS.map(w => (
                            <span key={w.name} className={w.color}>{w.name}</span>
                        ))}
                    </div>

                    {/* خانه‌های تقویم */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* خانه‌های خالی شروع ماه */}
                        {Array.from({ length: startOffset }).map((_, i) => (
                            <div key={`off-${i}`} className="flex aspect-square items-center justify-center" />
                        ))}

                        {/* روزهای ماه */}
                        {Array.from({ length: 31 }).map((_, i) => {
                            const dayNum = i + 1;
                            const isSelected = dayNum === selectedDay;
                            const isHoliday = holidays.includes(dayNum);
                            const dayData = getDayData(dayNum);

                            // اعداد فرضی میلادی و قمری
                            const gregNum = (dayNum + 21) > 31 ? (dayNum + 21) % 31 : dayNum + 21;
                            const hijriNum = dayNum + 4;

                            return (
                                <button
                                    key={dayNum}
                                    onClick={() => setSelectedDay(dayNum)}
                                    className={`relative flex aspect-square w-full flex-col items-center justify-center rounded-xl transition-all
                                        ${isSelected
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : isHoliday
                                            ? 'bg-[#fff3e0] text-[#d97706]'
                                            : 'bg-[#f8f9fa] text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {/* نمایش تعداد رزروها در بالا سمت راست */}
                                    {dayData.booked > 0 && (
                                        <div className={`absolute top-1 right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-bold
                                            ${isSelected ? 'bg-white text-blue-600' : 'bg-red-500 text-white shadow-sm'}`}>
                                            {toFa(dayData.booked)}
                                        </div>
                                    )}

                                    <span className="text-2xl font-bold">{toFa(dayNum)}</span>

                                    <div className={`absolute bottom-1 flex w-full justify-between px-1.5 text-[10px] 
                                        ${isSelected ? 'text-blue-100' : isHoliday ? 'text-orange-300' : 'text-gray-400'}`}>
                                        <span>{toFa(hijriNum)}</span>
                                        <span>{gregNum}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Slots List for Selected Date */}
                {selectedDayInfo && (
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                                <CalendarCheck className="text-blue-600" size={20} />
                                نوبت‌های {toFa(selectedDay || 1)} خرداد
                            </h3>
                            <div className="flex gap-3 text-sm">
                                <span className="text-blue-600 font-medium">{toFa(selectedDayInfo.available)} خالی</span>
                                <span className="text-gray-500">{toFa(selectedDayInfo.booked)} رزرو شده</span>
                            </div>
                        </div>

                        {selectedDayInfo.slots.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                نوبتی برای این روز تعریف نشده است.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedDayInfo.slots.map(slot => (
                                    <Card key={slot.id} className={`p-4 transition-all ${slot.status === 'booked' ? 'border-r-4 border-r-gray-400 bg-gray-50' : 'border-r-4 border-r-blue-500 hover:shadow-md'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${slot.status === 'booked' ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 text-lg">
                                                        {toFa(slot.start_time)} <span className="text-sm font-normal text-gray-500 mx-1">تا</span> {toFa(slot.end_time)}
                                                    </div>
                                                    {slot.status === 'booked' && slot.patient_name && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                                            <Users size={14} />
                                                            {slot.patient_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                {slot.status === 'available' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                                        <CheckCircle2 size={16} />
                                                        آزاد
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-600">
                                                        رزرو شده
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
