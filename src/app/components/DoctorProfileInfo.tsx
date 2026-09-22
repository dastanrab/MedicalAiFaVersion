import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
    Heart, Star, ThumbsUp, CheckCircle, MapPin,
    Calendar, Clock, ChevronRight, Phone, MessageSquare, Video, Loader2
} from 'lucide-react';
import { DoctorData, TimeSlot } from './types';
import { formatPrice, getShortDay, getShortDate } from './shared';

interface Props {
    doctorData: DoctorData;
    isFavorite: boolean;
    setIsFavorite: React.Dispatch<React.SetStateAction<boolean>>;
    activeTempReservation: TimeSlot | null;
    firstAvailableDate: string;
    firstAvailableSlot: TimeSlot | null;
    handleMainBookClick: () => void;
    handleStartChat: () => void;
    isStartingChat: boolean;
    navigate: (path: string) => void;
    id: string;
}

export function DoctorProfileInfo({
                                      doctorData, isFavorite, setIsFavorite, activeTempReservation,
                                      firstAvailableDate, firstAvailableSlot, handleMainBookClick,
                                      handleStartChat, isStartingChat, navigate, id
                                  }: Props) {
    return (
        <div className={`pb-6 px-4 sm:px-6 lg:px-8 max-w-6xl xl:max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 animate-in fade-in duration-200 ${activeTempReservation ? 'pt-2' : 'pt-20'}`}>
            {/* ستون راست (اطلاعات پزشک) */}
            <div className="w-full lg:w-[62%] xl:w-[65%] space-y-6 order-1 lg:order-none">
                <Card className="bg-white p-6 lg:p-7 shadow-sm border border-gray-100 rounded-2xl relative">
                    <button
                        onClick={() => setIsFavorite(f => !f)}
                        className="absolute top-4 left-4 text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-50 transition"
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <img
                            src={doctorData.image_url || 'https://placehold.co/112x112/e2e8f0/64748b?text=Dr'}
                            alt={`دکتر ${doctorData.name}`}
                            className="w-28 h-28 lg:w-32 lg:h-32 rounded-full object-cover ring-4 ring-blue-50 shadow-sm flex-shrink-0"
                        />
                        <div className="flex-1 text-center sm:text-right min-w-0">
                            <h1 className="text-xl lg:text-2xl xl:text-3xl font-black text-gray-900 mb-1">
                                دکتر {doctorData.name}
                            </h1>
                            <p className="text-blue-700 font-bold text-sm lg:text-base mb-3">
                                {doctorData.specialty_name}
                            </p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs lg:text-sm text-gray-500 mb-3">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{doctorData.city ?? 'تهران'}</span>
                            </div>
                            <div className="flex items-center justify-center sm:justify-start gap-1 text-xs lg:text-sm text-blue-700 bg-blue-50 w-fit mx-auto sm:mx-0 px-3 py-1 rounded-full font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>کد نظام پزشکی: {doctorData.medical_code ?? '---'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-x-reverse border border-gray-100 rounded-xl p-4 lg:p-5 bg-gray-50/50 mt-5">
                        <div className="text-center flex flex-col items-center">
                            <div className="flex items-center text-amber-500 font-black text-base lg:text-lg">
                                <span>{doctorData.rating ?? '۵.۰'}</span>
                                <Star className="w-4 h-4 lg:w-5 lg:h-5 fill-amber-400 mr-1" />
                            </div>
                            <span className="text-[11px] lg:text-xs text-gray-500 mt-0.5">({doctorData.reviews ?? 0} نظر)</span>
                        </div>
                        <div className="text-center flex flex-col items-center">
                            <div className="flex items-center text-emerald-600 font-black text-base lg:text-lg">
                                <span>{doctorData.recommendation ?? 95}٪</span>
                                <ThumbsUp className="w-4 h-4 lg:w-5 lg:h-5 mr-1" />
                            </div>
                            <span className="text-[11px] lg:text-xs text-gray-500 mt-0.5">پیشنهاد کاربران</span>
                        </div>
                        <div className="text-center flex flex-col items-center">
                            <div className="flex items-center text-blue-600 font-black text-base lg:text-lg">
                                <span>{new Intl.NumberFormat('fa-IR').format(doctorData.visit_count || doctorData.appointments || 0)}</span>
                                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 mr-1" />
                            </div>
                            <span className="text-[11px] lg:text-xs text-gray-500 mt-0.5">نوبت موفق</span>
                        </div>
                    </div>
                </Card>
                <Card className="bg-white p-6 lg:p-7 shadow-sm border border-gray-100 rounded-2xl space-y-3">
                    <h2 className="text-base lg:text-lg font-bold text-gray-900">درباره دکتر {doctorData.name}</h2>
                    <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 text-xs lg:text-sm text-blue-900 leading-relaxed">
                        <strong className="font-bold">تذکر مهم:</strong> زمان انتخابی شما ساعت مراجعه به مطب است، نه زمان ملاقات فوری با پزشک. زمان دقیق ملاقات توسط منشی تعیین می‌شود.
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
                        {doctorData.bio || 'پزشک متعهد و متخصص در تشخیص و درمان نوین بیماری‌ها.'}
                    </p>
                </Card>
            </div>
            {/* ستون چپ (کارت‌های رزرو) */}
            <div className="w-full lg:w-[38%] xl:w-[35%] space-y-4 order-2 lg:order-none">
                <Card className="bg-white p-5 lg:p-6 shadow-sm border border-gray-100 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3 text-gray-900">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-sm lg:text-base">نوبت‌دهی اینترنتی مطب</h3>
                    </div>
                    <div className="bg-gray-50 p-3.5 rounded-xl mb-4 border border-gray-100 space-y-2.5 text-xs lg:text-sm">
                        <div className="flex items-start text-gray-700">
                            <MapPin className="w-3.5 h-3.5 ml-1.5 mt-0.5 text-blue-600 flex-shrink-0" />
                            <span>{doctorData.address || 'آدرس مطب ثبت نشده است'}</span>
                        </div>
                        {firstAvailableDate && (
                            <div className="flex items-center text-gray-700 font-medium">
                                <Clock className="w-3.5 h-3.5 ml-1.5 text-blue-600 flex-shrink-0" />
                                <span>
                                    اولین نوبت: {getShortDay(firstAvailableDate)}{' '}
                                    {getShortDate(firstAvailableDate)}
                                    {firstAvailableSlot?.start_time && ` - ساعت ${firstAvailableSlot.start_time}`}
                                </span>
                            </div>
                        )}
                    </div>
                    <Button
                        onClick={handleMainBookClick}
                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs lg:text-sm shadow flex items-center justify-center gap-1"
                    >
                        {activeTempReservation ? 'مشاهده و تغییر نوبت' : 'نوبت بگیرید'}
                        <ChevronRight className="w-4 h-4 rotate-180" />
                    </Button>
                </Card>
                <Card className="bg-white p-5 lg:p-6 shadow-sm border border-gray-100 rounded-2xl">
                    <div className="flex items-center justify-between mb-3 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <h3 className="font-bold text-sm lg:text-base whitespace-nowrap">مشاوره آنلاین</h3>
                        </div>
                        <span className="text-xs lg:text-sm font-bold text-emerald-700 whitespace-nowrap">
                            {formatPrice(doctorData.visit_price)}
                        </span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-500 mb-4 leading-relaxed">
                        پاسخ‌گویی سریع، ارسال تصویر آزمایش و نسخه الکترونیک
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                        <Button
                            onClick={handleStartChat}
                            disabled={isStartingChat}
                            variant="outline"
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 py-2.5 min-h-[42px] lg:min-h-[48px] px-3 rounded-xl text-xs lg:text-sm font-bold flex items-center justify-center gap-1.5 whitespace-nowrap overflow-hidden"
                        >
                            {isStartingChat ? <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" /> : <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />}
                            <span className="truncate">چت متنی</span>
                        </Button>
                        <Button
                            onClick={() => navigate(`/consultation/${id}`)}
                            variant="outline"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50 py-2.5 min-h-[42px] lg:min-h-[48px] px-3 rounded-xl text-xs lg:text-sm font-bold flex items-center justify-center gap-1.5 whitespace-nowrap overflow-hidden"
                        >
                            <Video className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">تصویری</span>
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}