import { useLocation, useNavigate } from 'react-router';
import {ArrowRight, Star, Loader2, User, Stethoscope} from 'lucide-react';
import { Button } from '../components/ui/button';
import { AppBar } from '../components/AppBar';
import { useState, useEffect } from 'react';
import { useAuthStore } from "../store/authStore";

interface Doctor {
    id: number;
    name: string;
    image_url: string;
    rating: number;
    visit_price: number;
    experience: string;
    is_vip: boolean;
}

interface Lab {
    id: number;
    name: string;
    image_url: string;
    rating: number;
    address?: string;
}

interface Question {
    id: string;
    question: string;
    type: 'select' | 'radio' | 'number' | 'text';
    options: string[] | null;
    required: boolean;
    placeholder: string | null;
}

interface Form {
    specialty: string;
    title: string;
    description: string;
    questions: Question[];
}

interface DiagnosisResponse {
    specialty: {
        primary: string;
        secondary?: string[];
        recommended_specialist: string;
        specialty_id: number;
        specialty_name_fa: string;
    };
    urgency_level: string;
    diagnosis: string[];
    diagnosis_description?: string;
    red_flags: string[];
    recommended_tests: string[];
    recommended_exercises: string[];
    lifestyle_changes: string[];
    notes: string;
    recommended_doctors: Doctor[];
    recommended_labs: Lab[];
    form: Form;
    user_symptoms: string;
    medical_history?: string;
}

// داده‌های تستی
const mockDoctors: Doctor[] = [
    {
        id: 1,
        name: "دکتر محمد احمدی",
        image_url: "https://cdn.tarhpik.com/5_Preview/1404/6/30/053235/a-male-doctor-in-a-white-coat-and-glasses-free-png-400.webp",
        rating: 4.8,
        visit_price: 500000,
        experience: "15 سال",
        is_vip: true
    },
    {
        id: 2,
        name: "دکتر سارا محمدی",
        image_url: "https://cdn.tarhpik.com/5_Preview/1404/6/30/053235/a-male-doctor-in-a-white-coat-and-glasses-free-png-400.webp",
        rating: 4.9,
        visit_price: 600000,
        experience: "12 سال",
        is_vip: true
    }
];

const mockLabs: Lab[] = [
    {
        id: 1,
        name: "آزمایشگاه پاستور",
        image_url: "https://cdn.tarhpik.com/5_Preview/1404/6/30/053235/a-male-doctor-in-a-white-coat-and-glasses-free-png-400.webp",
        rating: 4.5,
        address: "تهران، خیابان ولیعصر"
    },
    {
        id: 2,
        name: "آزمایشگاه مهر",
        image_url: "https://cdn.tarhpik.com/5_Preview/1404/6/30/053235/a-male-doctor-in-a-white-coat-and-glasses-free-png-400.webp",
        rating: 4.7,
        address: "تهران، میدان ونک"
    },
    {
        id: 3,
        name: "آزمایشگاه سینا",
        image_url: "https://cdn.tarhpik.com/5_Preview/1404/6/30/053235/a-male-doctor-in-a-white-coat-and-glasses-free-png-400.webp",
        rating: 4.8,
        address: "تهران، سعادت‌آباد"
    }
];

export function DiagnosisResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const accessToken = useAuthStore((state) => state.accessToken);

    const { requestPayload, isLoading: initialLoading } = location.state as {
        requestPayload?: any;
        isLoading?: boolean;
        result?: DiagnosisResponse;
    };

    const [result, setResult] = useState<DiagnosisResponse | null>(
        location.state?.result ? location.state.result.data : null
    );
    const [loading, setLoading] = useState(initialLoading || false);
    const [error, setError] = useState<string | null>(null);

    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showContent, setShowContent] = useState(false);

    // فراخوانی API اگر requestPayload وجود داشته باشد
    useEffect(() => {
        if (requestPayload && !result) {
            fetchDiagnosis();
        }
    }, []);

    const fetchDiagnosis = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://185.222.163.113:7000/api/user/diagnosis/diagnose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(requestPayload),
            });

            if (!response.ok) throw new Error('خطا در دریافت پاسخ از سرور');

            const data = await response.json();

            // اضافه کردن داده‌های تستی اگر وجود نداشتند
            const enrichedData = {
                ...data.data,
                recommended_doctors: data.data.recommended_doctors,
                recommended_labs:data.data.recommended_labs

            };

            setResult(enrichedData);
            setLoading(false);
        } catch (err) {
            setError('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
            setLoading(false);
        }
    };

    const fullText = result?.diagnosis_description || '';

    useEffect(() => {
        if (!result || loading) return;

        if (!fullText) {
            setIsTyping(false);
            setShowContent(true);
            return;
        }

        let currentIndex = 0;
        const typingSpeed = 80;

        const typingInterval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setDisplayedText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
                setIsTyping(false);
                setTimeout(() => {
                    setShowContent(true);
                }, 600);
            }
        }, typingSpeed);

        setIsTyping(true);
        return () => clearInterval(typingInterval);
    }, [result, fullText, loading]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
    };

    // حالت خطا
    if (error) {
        return (
            <div className="h-full bg-gradient-to-b from-blue-50 to-white flex items-center justify-center" dir="rtl">
                <AppBar title="نتیجه تشخیص" />
                <div className="text-center px-6">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                    <Button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        بازگشت
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-gradient-to-b from-blue-50 to-white overflow-y-auto relative" dir="rtl">
            <AppBar title="نتیجه تشخیص" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-24">
                {/* چت باکس - علایم بیمار و تشخیص اولیه */}
                <div className="mb-5">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                        {/* پیام کاربر - علایم */}
                        {requestPayload?.symptoms && (
                            <div className="flex items-start gap-3 justify-end">
                                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
                                    <p className="text-sm leading-relaxed">{requestPayload.symptoms}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-blue-600" />
                                </div>
                            </div>
                        )}

                        {/* پاسخ سیستم - تشخیص اولیه */}
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <Stethoscope className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                                {loading ? (
                                    <div className="flex items-start gap-2">
                                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6"></div>
                                        </div>
                                    </div>
                                ) : displayedText ? (
                                    <div className="flex items-start gap-2">
                                        {isTyping && (
                                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin mt-0.5 flex-shrink-0" />
                                        )}
                                        <p className="text-gray-700 text-sm leading-relaxed flex-1">
                                            {displayedText}
                                            {isTyping && (
                                                <span className="inline-block w-0.5 h-4 bg-blue-600 mr-0.5 animate-pulse"></span>
                                            )}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">نتیجه‌ای یافت نشد</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                {/* بقیه محتوا - با افکت blur تا زمان اتمام تایپ */}
                <div className={`transition-all duration-500 ${!showContent ? 'blur-md opacity-50 pointer-events-none' : 'blur-0 opacity-100'}`}>
                    {/* دکترها و آزمایشگاه‌ها */}
                    <div className="space-y-5 mb-5">
                        {/* دکترها */}
                        <div className="w-full">
                            <h2 className="text-base font-semibold text-gray-800 mb-3 px-1">پزشکان پیشنهادی</h2>
                            <div
                                className="overflow-x-auto pb-2 -mx-1 px-1"
                                style={{
                                    overflowY: 'visible',
                                    WebkitOverflowScrolling: 'touch'
                                }}
                            >
                                <div className="flex flex-nowrap gap-4" style={{ minWidth: 'min-content' }}>
                                    {(result?.recommended_doctors && result.recommended_doctors.length > 0
                                            ? result.recommended_doctors
                                            : mockDoctors
                                    ).map((doctor) => (
                                        <div
                                            key={doctor.id}
                                            className="flex-none w-28 bg-white rounded-xl p-3 text-center shadow-sm border border-gray-50 transition-all hover:shadow-md"
                                        >
                                            <div className="relative inline-block mb-2">
                                                <img
                                                    src={doctor.image_url}
                                                    alt={doctor.name}
                                                    className="w-16 h-16 rounded-full object-cover mx-auto ring-1 ring-gray-100"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/80';
                                                    }}
                                                />
                                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5">
                                                    <span className="text-xs font-medium text-gray-700">{doctor.rating}</span>
                                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                </div>
                                            </div>
                                            <h3 className="font-medium text-gray-800 text-xs leading-tight mb-0.5 line-clamp-2">
                                                {doctor.name}
                                            </h3>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* آزمایشگاه‌ها */}
                        <div className="w-full">
                            <h2 className="text-base font-semibold text-gray-800 mb-3 px-1">آزمایشگاه‌های پیشنهادی</h2>
                            <div
                                className="overflow-x-auto pb-2 -mx-1 px-1"
                                style={{
                                    overflowY: 'visible',
                                    WebkitOverflowScrolling: 'touch'
                                }}
                            >
                                <div className="flex flex-nowrap gap-4" style={{ minWidth: 'min-content' }}>
                                    {(result?.recommended_labs && result.recommended_labs.length > 0
                                            ? result.recommended_labs
                                            : mockLabs
                                    ).map((lab) => (
                                        <div
                                            key={lab.id}
                                            className="flex-none w-28 bg-white rounded-xl p-3 text-center shadow-sm border border-gray-50 transition-all hover:shadow-md"
                                        >
                                            <div className="relative inline-block mb-2">
                                                <img
                                                    src={lab.image_url}
                                                    alt={lab.name}
                                                    className="w-16 h-16 rounded-full object-cover mx-auto ring-1 ring-gray-100"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/80';
                                                    }}
                                                />
                                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5">
                                                    <span className="text-xs font-medium text-gray-700">{lab.rating}</span>
                                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                </div>
                                            </div>
                                            <h3 className="font-medium text-gray-800 text-xs leading-tight mb-0.5 line-clamp-2">
                                                {lab.name}
                                            </h3>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* فرم تکمیلی */}
                    {result?.form && (
                        <div className="mb-5">
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <h2 className="text-base font-semibold text-gray-800 mb-2">{result.form.title}</h2>
                                <p className="text-sm text-gray-600 mb-4">{result.form.description}</p>
                                <Button
                                    onClick={() => navigate('/questionnaire', { state: { form: result.form, previousResult: result } })}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    تکمیل فرم تخصصی
                                    <ArrowRight className="mr-2 w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
