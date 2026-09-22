import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Info, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import { DoctorData, TimeSlot, UserProfile, OtherPatient, Gateway, ViewState } from './types';
import { formatDate, Stepper, CountdownTimer } from './shared';

interface Props {
    doctorData: DoctorData;
    selectedDate: string;
    selectedSlot: TimeSlot | null;
    activeTempReservation: TimeSlot | null;
    bookingFor: 'myself' | 'other';
    currentUser: UserProfile | null;
    otherPatient: OtherPatient;
    fetchDoctorData: () => void;
    selectedGateway: Gateway;
    setSelectedGateway: React.Dispatch<React.SetStateAction<Gateway>>;
    paymentError: string | null;
    isPaying: boolean;
    handleProceedToPayment: () => void;
    setView: React.Dispatch<React.SetStateAction<ViewState>>;
    // پراپ جدید برای تشخیص نوع سفارش
    orderType?: 'appointment' | 'chat';
}

export function PaymentSummaryView({
                                       doctorData, selectedDate, selectedSlot, activeTempReservation,
                                       bookingFor, currentUser, otherPatient, fetchDoctorData,
                                       selectedGateway, setSelectedGateway, paymentError, isPaying,
                                       handleProceedToPayment, setView, orderType = 'appointment'
                                   }: Props) {

    const isChat = orderType === 'chat';

    // تعیین مبلغ قابل پرداخت (برای چت کل مبلغ، برای نوبت 15000 تومان)
    // فرض بر این است که قیمت چت در visit_price است (یا chat_price اگر به API اضافه کرده‌اید)
    const chatPrice = (doctorData as any).chat_price ?? doctorData.visit_price ?? 50000;
    const finalAmount = isChat ? chatPrice : 15000;
    const formattedAmount = `${finalAmount.toLocaleString('fa-IR')} تومان`;

    // تنظیم آیتم‌های خلاصه وضعیت بر اساس نوع سفارش
    const summaryItems = isChat ? [
        ['نوع خدمات', 'مشاوره متنی (آنلاین)'],
        ['پزشک', `دکتر ${doctorData.name}`],
        ['تخصص', doctorData.specialty_name],
        ['بیمار', bookingFor === 'myself' ? (currentUser?.name ?? 'حساب اصلی') : (otherPatient.fullName || 'ثبت شده در سفارش قبلی')],
    ] : [
        ['پزشک معالج', `دکتر ${doctorData.name}`],
        ['تخصص', doctorData.specialty_name],
        ['نوع ویزیت', 'حضوری در مطب'],
        ['زمان نوبت', `${formatDate(selectedDate)} - ${selectedSlot?.start_time}`],
        ['بیمار', bookingFor === 'myself' ? (currentUser?.name ?? 'حساب اصلی') : (otherPatient.fullName || 'ثبت شده در سفارش قبلی')],
        ['آدرس', doctorData.address],
    ];

    return (
        <div className={`pb-6 animate-in fade-in duration-200 ${activeTempReservation ? 'pt-2' : 'pt-20'}`}>
            {/* در حالت چت نیازی به نمایش استپر نوبت‌دهی (مرحله 3) نیست، اما اگر می‌خواهید بماند می‌توانید حفظش کنید */}
            {!isChat && <Stepper step={3} />}

            <div className={`max-w-4xl mx-auto px-4 flex flex-col md:flex-row gap-5 ${isChat ? 'pt-4' : ''}`}>
                {/* خلاصه سفارش */}
                <div className="w-full md:w-1/2 space-y-4 order-1 md:order-none">
                    <Card className="bg-white p-5 shadow-sm border-0 rounded-2xl space-y-3 text-xs">
                        <h3 className="font-bold text-gray-900 text-sm border-b pb-2">
                            {isChat ? 'خلاصه درخواست مشاوره' : 'خلاصه اطلاعات نوبت'}
                        </h3>
                        {summaryItems.map(([label, value]) => (
                            <div key={label} className="flex justify-between gap-3 py-1">
                                <span className="text-gray-500 flex-shrink-0">{label}:</span>
                                <span className="font-medium text-gray-800 text-left max-w-[220px] truncate">{value}</span>
                            </div>
                        ))}
                    </Card>
                </div>

                {/* جزئیات پرداخت */}
                <div className="w-full md:w-1/2 space-y-4 order-2 md:order-none">
                    <div className="bg-amber-50 text-amber-900 p-3.5 rounded-xl border border-amber-200 flex flex-col gap-2 text-xs font-medium">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span>
                                {isChat
                                    ? 'درخواست مشاوره شما هنوز قطعی نشده؛ برای فعال‌سازی اتاق چت پرداخت را تکمیل کنید.'
                                    : 'نوبت شما هنوز قطعی نشده؛ برای تکمیل فرآیند روی دکمه پرداخت کلیک کنید.'}
                            </span>
                        </div>
                        {(!isChat && activeTempReservation?.expires_at) && (
                            <div className="text-amber-700 bg-amber-100/50 py-1.5 px-3 rounded-lg w-fit">
                                زمان باقیمانده تا لغو خودکار:
                                <CountdownTimer expiresAt={activeTempReservation.expires_at} onExpire={fetchDoctorData} />
                            </div>
                        )}
                    </div>

                    <Card className="bg-white p-5 shadow-sm border-0 rounded-2xl space-y-4">
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 border-b border-gray-100 pb-2.5">جزئیات پرداخت</h3>
                        <div className="space-y-2.5 text-xs text-gray-600">
                            <div className="flex justify-between">
                                <span>{isChat ? 'هزینه مشاوره متنی:' : 'هزینه خدمات زیرساخت:'}</span>
                                <span className="font-bold text-gray-900">{formattedAmount}</span>
                            </div>
                            <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-sm text-gray-900">
                                <span>مبلغ قابل پرداخت الان:</span>
                                <span className="text-blue-700 font-extrabold">{formattedAmount}</span>
                            </div>
                        </div>

                        <div className="bg-emerald-50/60 p-4 border border-emerald-100 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5 mt-4">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold mb-1">با اطمینان پرداخت کنید</h4>
                                <p className="text-emerald-700 text-[11px] leading-relaxed">
                                    {isChat
                                        ? 'با پرداخت این مبلغ، اتاق چت شما با پزشک فوراً فعال شده و می‌توانید مدارک و پیام‌های خود را ارسال کنید.'
                                        : `مبلغ ویزیت پزشک (معادل ${doctorData.visit_price.toLocaleString('fa-IR')} تومان) را باید به صورت حضوری در مطب پرداخت نمایید. مبلغ پرداختی در این مرحله صرفاً بابت هزینه زیرساخت و خدمات است.`
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">درگاه پرداخت:</label>
                            <select
                                className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                value={selectedGateway}
                                onChange={(e) => setSelectedGateway(e.target.value as Gateway)}
                            >
                                <option value="saman">پرداخت آنلاین با کارت بانکی (سامان - سپ)</option>
                                <option value="zarinpal">زرین‌پال</option>
                            </select>
                        </div>

                        {paymentError && <div className="text-red-600 text-xs text-center bg-red-50 p-3 rounded-xl border border-red-100">{paymentError}</div>}

                        <div className="pt-2 flex items-center gap-3">
                            <Button variant="outline" onClick={() => setView('profile')} className="w-1/3 rounded-xl h-11 text-xs">بازگشت</Button>
                            <Button onClick={handleProceedToPayment} disabled={isPaying} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 text-xs font-bold shadow flex items-center justify-center gap-1.5">
                                {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                                {isChat ? 'پرداخت و شروع چت' : 'پرداخت و ثبت نوبت'}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}