import { useLocation, useNavigate } from 'react-router';
import { ArrowRight, Star, Loader2, User, Stethoscope, Send, Calendar, UserCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { AppBar } from '../components/AppBar';
import type { SymptomFormState } from './SymptomSelection';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from "../store/authStore";

// --- Interfaces ---
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

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatResponse {
    status: 'need_more_info' | 'complete';
    message?: string;
    diagnosis?: any;
    specialty?: {
        specialty_id?: number;
        specialty_name_fa?: string;
        primary?: string;
    };
    recommended_doctors?: Doctor[];
    recommended_labs?: Lab[];
    form?: Form;
}

// حالت‌های مختلف برای فرم سن و جنسیت
type AgeGenderFormState = 'idle' | 'waiting' | 'submitted';

export function DiagnosisResultV1() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const accessToken = useAuthStore((state) => state.accessToken);

    const { requestPayload, symptomFormState } = location.state as {
        requestPayload?: any;
        symptomFormState?: SymptomFormState;
    };

    const handleApiResponse = (json: any): ChatResponse => {
        if (!json.success) throw new Error(json.message || 'خطا در عملیات');
        // اگر session_id اومد و هنوز ذخیره نشده، ذخیره کن
        if (json.session_id && !sessionId) {
            setSessionId(json.session_id);
        }
        return json.data as ChatResponse;
    };

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [status, setStatus] = useState<'idle' | 'chatting' | 'complete'>('idle');
    const [finalResult, setFinalResult] = useState<ChatResponse | null>(null);

    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showContent, setShowContent] = useState(false);

    // حالت‌های فرم سن و جنسیت
    const [ageGenderForm, setAgeGenderForm] = useState<AgeGenderFormState>('idle');
    const [age, setAge] = useState<string>('');
    const [gender, setGender] = useState<'male' | 'female' | ''>('');
    const [isPregnant, setIsPregnant] = useState<boolean>(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const isFirstRun = useRef(true);

    // اسکرول خودکار به پایین
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading, ageGenderForm]);

    // شروع خودکار چت با علائم دریافتی از صفحه قبل
    useEffect(() => {
        if (requestPayload?.symptoms && isFirstRun.current) {
            isFirstRun.current = false;

            // پیام اولیه کاربر شامل علائم
            const initialMessage = requestPayload.symptoms;
            setMessages([{ role: 'user', content: initialMessage }]);

            // شروع چت با سرور
            startChatWithServer(initialMessage);
        }
    }, [requestPayload]);

    const startChatWithServer = async (userMessage: string) => {
        setLoading(true);
        setError(null);
        setStatus('chatting');

        try {
            const response = await fetch('http://185.222.163.113:7000/api/user/diagnosis/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: userMessage }],
                    session_id: sessionId,
                }),
            });

            if (!response.ok) throw new Error('خطا در دریافت پاسخ از سرور');

            const json = await response.json();
            if (!json.success) throw new Error(json.message || 'خطا در عملیات');

            const data = handleApiResponse(json);

            if (data.status === 'need_more_info') {
                // بررسی آیا پیام مربوط به سن و جنسیت است
                const message = data.message || '';
                const isAgeGenderQuestion = message.includes('سن') && message.includes('جنسیت');

                if (isAgeGenderQuestion) {
                    // نمایش فرم سن و جنسیت
                    setAgeGenderForm('waiting');
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: 'لطفاً سن و جنسیت خود را مشخص کنید:'
                    }]);
                } else {
                    // ادامه چت معمولی
                    setMessages(prev => [...prev, { role: 'assistant', content: message }]);
                }
            } else if (data.status === 'complete') {
                handleCompleteResponse(data);
            }
        } catch (err) {
            console.error(err);
            setError('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ متأسفانه در ارتباط با سرور مشکلی پیش آمد.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (textContent: string) => {
        if (!textContent.trim() || loading) return;

        const newMessages: Message[] = [...messages, { role: 'user', content: textContent }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://185.222.163.113:7000/api/user/diagnosis/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ messages: newMessages , session_id: sessionId,}),
            });

            if (!response.ok) throw new Error('خطا در دریافت پاسخ از سرور');

            const json = await response.json();
            if (!json.success) throw new Error(json.message || 'خطا در عملیات');

            const data = handleApiResponse(json);

            if (data.status === 'need_more_info') {
                // بررسی آیا پیام مربوط به سن و جنسیت است
                const message = data.message || '';
                const isAgeGenderQuestion = message.includes('سن') && message.includes('جنسیت');

                if (isAgeGenderQuestion) {
                    // نمایش فرم سن و جنسیت
                    setAgeGenderForm('waiting');
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: 'لطفاً سن و جنسیت خود را مشخص کنید:'
                    }]);
                } else {
                    // ادامه چت معمولی
                    setMessages(prev => [...prev, { role: 'assistant', content: message }]);
                }
            } else if (data.status === 'complete') {
                handleCompleteResponse(data);
            }
        } catch (err) {
            console.error(err);
            setError('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ متأسفانه در ارتباط با سرور مشکلی پیش آمد.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteResponse = (data: ChatResponse) => {
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: data.diagnosis?.diagnosis_description || 'تشخیص اولیه کامل شد.'
        }]);
        setFinalResult(data);
        setStatus('complete');
    };

    // ارسال اطلاعات سن و جنسیت
    const submitAgeGender = async () => {
        if (!age.trim() || !gender) {
            alert('لطفاً سن و جنسیت خود را وارد کنید.');
            return;
        }

        let userResponse = `سن: ${age} سال، جنسیت: ${gender === 'male' ? 'مرد' : 'زن'}`;

        // اگر زن است و در سن باروری (فرضاً 15-50 سال)، سوال بارداری بپرسیم
        const ageNum = parseInt(age);
        if (gender === 'female' && ageNum >= 15 && ageNum <= 50) {
            // در اینجا می‌توانیم یک سوال اضافی برای بارداری بپرسیم
            // اما برای سادگی، فعلاً فقط اطلاعات سن و جنسیت را می‌فرستیم
            // اگر نیاز به سوال بارداری دارید، می‌توانید یک مرحله دیگر اضافه کنید
        }

        // اضافه کردن پاسخ کاربر به تاریخچه چت
        const newMessages = [...messages, { role: 'user', content: userResponse }];
        setMessages(newMessages);
        setAgeGenderForm('submitted');

        // ارسال به سرور
        setLoading(true);

        try {
            const response = await fetch('http://185.222.163.113:7000/api/user/diagnosis/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ messages: newMessages ,  session_id: sessionId,}),

            });

            if (!response.ok) throw new Error('خطا در دریافت پاسخ از سرور');

            const json = await response.json();
            if (!json.success) throw new Error(json.message || 'خطا در عملیات');

            const data = handleApiResponse(json);

            if (data.status === 'need_more_info') {
                setMessages(prev => [...prev, { role: 'assistant', content: data.message || '' }]);
                setAgeGenderForm('idle'); // برگشت به حالت چت معمولی
            } else if (data.status === 'complete') {
                handleCompleteResponse(data);
            }
        } catch (err) {
            console.error(err);
            setError('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ متأسفانه در ارتباط با سرور مشکلی پیش آمد.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    // افکت تایپ نویسی فقط برای پیام نهایی
    useEffect(() => {
        if (status !== 'complete' || !finalResult) return;

        const lastMsg = messages[messages.length - 1]?.content || '';

        let currentIndex = 0;
        const typingSpeed = 40;

        const typingInterval = setInterval(() => {
            if (currentIndex <= lastMsg.length) {
                setDisplayedText(lastMsg.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
                setIsTyping(false);
                setTimeout(() => setShowContent(true), 500);
            }
        }, typingSpeed);

        setIsTyping(true);
        return () => clearInterval(typingInterval);
    }, [status, finalResult]);

    if (error && messages.length === 0) {
        return (
            <div className="h-dvh bg-gradient-to-b from-blue-50 to-white flex items-center justify-center" dir="rtl">
                <AppBar />
                <div className="text-center px-6">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                    <Button onClick={() => navigate(-1)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        بازگشت
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-dvh bg-gradient-to-b from-blue-50 to-white" dir="rtl">
            <AppBar backTo="/symptoms" backState={symptomFormState} />

            <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-4 flex flex-col">
                {/* محیط چت باکس */}
                <div className="flex-1 space-y-4 mb-4">
                    {messages.map((msg, idx) => {
                        const isLastAndComplete = status === 'complete' && idx === messages.length - 1;

                        return (
                            <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Stethoscope className="w-4 h-4 text-white" />
                                    </div>
                                )}

                                <div className={`px-4 py-3 max-w-[85%] text-sm leading-relaxed shadow-sm ${
                                    msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                                }`}>
                                    {isLastAndComplete ? (
                                        <div className="flex items-start gap-2">
                                            {isTyping && <Loader2 className="w-4 h-4 text-blue-600 animate-spin mt-0.5 flex-shrink-0" />}
                                            <p className="flex-1">
                                                {displayedText}
                                                {isTyping && <span className="inline-block w-0.5 h-4 bg-blue-600 mr-0.5 animate-pulse"></span>}
                                            </p>
                                        </div>
                                    ) : (
                                        msg.content
                                    )}
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                                        <User className="w-4 h-4 text-blue-600" />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* فرم سن و جنسیت */}
                    {ageGenderForm === 'waiting' && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <UserCircle className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="font-medium text-gray-800">لطفاً اطلاعات زیر را تکمیل کنید:</h3>
                            </div>

                            <div className="space-y-4">
                                {/* فیلد سن */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        سن (سال)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="مثال: III"
                                        autoFocus
                                    />
                                </div>

                                {/* فیلد جنسیت */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        جنسیت
                                    </label>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setGender('male')}
                                            className={`flex-1 py-2 px-4 rounded-lg border ${gender === 'male'
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            مرد
                                        </button>
                                        <button
                                            onClick={() => setGender('female')}
                                            className={`flex-1 py-2 px-4 rounded-lg border ${gender === 'female'
                                                ? 'bg-pink-50 border-pink-500 text-pink-700'
                                                : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            زن
                                        </button>
                                    </div>
                                </div>

                                {/* سوال بارداری (فقط برای زنان در سن باروری) */}
                                {gender === 'female' && parseInt(age) >= 15 && parseInt(age) <= 50 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            آیا باردار هستید؟
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setIsPregnant(true)}
                                                className={`flex-1 py-2 px-4 rounded-lg border ${isPregnant
                                                    ? 'bg-green-50 border-green-500 text-green-700'
                                                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                بله
                                            </button>
                                            <button
                                                onClick={() => setIsPregnant(false)}
                                                className={`flex-1 py-2 px-4 rounded-lg border ${!isPregnant && isPregnant !== undefined
                                                    ? 'bg-red-50 border-red-500 text-red-700'
                                                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                خیر
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* دکمه ارسال */}
                                <Button
                                    onClick={submitAgeGender}
                                    disabled={!age.trim() || !gender || loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="ml-2 w-4 h-4 animate-spin" />
                                            در حال ارسال...
                                        </>
                                    ) : (
                                        'ارسال اطلاعات'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {loading && status !== 'complete' && ageGenderForm !== 'waiting' && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <Stethoscope className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* ورودی چت برای زمانی که اطلاعات بیشتری نیاز است و فرم سن و جنسیت فعال نیست */}
                {status === 'chatting' && !loading && ageGenderForm === 'idle' && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-2 flex gap-2 shadow-sm shrink-0 mb-4 animate-in fade-in slide-in-from-bottom-2">
                        <input
                            className="flex-1 outline-none text-sm px-3 bg-transparent"
                            placeholder="پاسخ خود را اینجا بنویسید..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                            autoFocus
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim()}
                            className="p-3 bg-blue-600 text-white rounded-xl disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* بخش نمایش نتایج نهایی */}
                {status === 'complete' && finalResult && (
                    <div className={`transition-all duration-700 shrink-0 ${!showContent ? 'blur-md opacity-0 pointer-events-none translate-y-4' : 'blur-0 opacity-100 translate-y-0'}`}>
                        {/* ... کونتنت قبلی بدون تغییر ... */}
                        <div className="space-y-5 mb-5">
                            {/* پزشکان */}
                            {finalResult.recommended_doctors && finalResult.recommended_doctors.length > 0 && (
                                <div className="w-full">
                                    <h2 className="text-base font-semibold text-gray-800 mb-3 px-1">
                                        پزشکان پیشنهادی ({finalResult.specialty?.specialty_name_fa})
                                    </h2>
                                    <div className="overflow-x-auto pb-2 -mx-1 px-1">
                                        <div className="flex flex-nowrap gap-4" style={{ minWidth: 'min-content' }}>
                                            {finalResult.recommended_doctors.map((doctor) => (
                                                <div
                                                    key={doctor.id}
                                                    className="flex-none w-28 bg-white rounded-xl p-3 text-center shadow-sm border border-gray-50 transition-all hover:shadow-md cursor-pointer"
                                                    onClick={() => {
                                                        // ذخیره اطلاعات در استوریج
                                                        sessionStorage.setItem('diagnosis_doctor_context', JSON.stringify({
                                                            sessionId: sessionId,
                                                            source: 'diagnosis'
                                                        }));

                                                        // باز کردن تب جدید
                                                        window.open(`/doctor/${doctor.id}`, '_blank');
                                                    }}
                                                    // onClick={() =>
                                                    //     // navigate(`/doctor/${doctor.id}`, {
                                                    //     //     state: {
                                                    //     //         sessionId,
                                                    //     //         source: 'diagnosis',
                                                    //     //     },
                                                    //     // })
                                                    // }
                                                >
                                                    <div className="relative inline-block mb-2">
                                                        <img src={doctor.image_url} alt={doctor.name} className="w-16 h-16 rounded-full object-cover mx-auto ring-1 ring-gray-100" />
                                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5">
                                                            <span className="text-xs font-medium text-gray-700">{doctor.rating}</span>
                                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                        </div>
                                                    </div>
                                                    <h3 className="font-medium text-gray-800 text-xs leading-tight mb-0.5 line-clamp-2">{doctor.name}</h3>
                                                </div>
                                            ))}

                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* آزمایشگاه‌ها */}
                            {finalResult.recommended_labs && finalResult.recommended_labs.length > 0 && (
                                <div className="w-full">
                                    <h2 className="text-base font-semibold text-gray-800 mb-3 px-1">آزمایشگاه‌های پیشنهادی</h2>
                                    <div className="overflow-x-auto pb-2 -mx-1 px-1">
                                        <div className="flex flex-nowrap gap-4" style={{ minWidth: 'min-content' }}>
                                            {finalResult.recommended_labs.map((lab) => (
                                                <div key={lab.id} className="flex-none w-28 bg-white rounded-xl p-3 text-center shadow-sm border border-gray-50 transition-all hover:shadow-md">
                                                    <div className="relative inline-block mb-2">
                                                        <img src={lab.image_url} alt={lab.name} className="w-16 h-16 rounded-full object-cover mx-auto ring-1 ring-gray-100" />
                                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5">
                                                            <span className="text-xs font-medium text-gray-700">{lab.rating}</span>
                                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                        </div>
                                                    </div>
                                                    <h3 className="font-medium text-gray-800 text-xs leading-tight mb-0.5 line-clamp-2">{lab.name}</h3>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* فرم تکمیلی */}
                        {finalResult.form && (
                            <div className="mb-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <h2 className="text-base font-semibold text-gray-800 mb-2">{finalResult.form.title}</h2>
                                <p className="text-sm text-gray-600 mb-4">{finalResult.form.description}</p>
                                <Button
                                    onClick={() => navigate('/questionnaire', { state: { form: finalResult.form, previousResult: finalResult } })}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    تکمیل فرم تخصصی
                                    <ArrowRight className="mr-2 w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
