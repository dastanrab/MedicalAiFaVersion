import { useLocation, useNavigate } from 'react-router';
import { ArrowRight, Star, Loader2, User, Stethoscope, Send, Calendar, UserCircle, Crown, ImageOff, RefreshCw, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { AppBar } from '../components/AppBar';
import type { SymptomFormState } from './SymptomSelection';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/useUserStore";

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
    image?: string; // فیلد برای نگهداری تصویر ارسالی
}

interface DrugDetails {
    description: string;
    side_effects: string;
    usage_and_dosage: string;
}

interface ChatResponse {
    status: 'need_more_info' | 'complete' | 'drug_info' | 'irrelevant_image';
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
    is_drug_inquiry?: boolean;
    drug_names?: string[];
    drug_details?: DrugDetails;
}

type AgeGenderFormState = 'idle' | 'asking_who' | 'waiting' | 'submitted';

export function DiagnosisResultV1() {
    const profile = useUserStore(s => s.user);
    const location = useLocation();
    const navigate = useNavigate();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const accessToken = useAuthStore(state => state.accessToken);

    const { requestPayload, symptomFormState } = (location.state as {
        requestPayload?: any;
        symptomFormState?: SymptomFormState;
    }) || {};

    const handleApiResponse = (json: any): ChatResponse => {
        if (!json.success) throw new Error(json.message || 'خطا در عملیات');
        if (json.session_id && !sessionId) {
            setSessionId(json.session_id);
        }
        return json.data as ChatResponse;
    };

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [status, setStatus] = useState<'idle' | 'chatting' | 'complete' | 'drug_info' | 'irrelevant_image'>('idle');
    const [finalResult, setFinalResult] = useState<ChatResponse | null>(null);

    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showContent, setShowContent] = useState(false);

    const [ageGenderForm, setAgeGenderForm] = useState<AgeGenderFormState>('idle');
    const [patientType, setPatientType] = useState<'me' | 'other' | null>(null);

    const [age, setAge] = useState<string>('');
    const [gender, setGender] = useState<'male' | 'female' | ''>('');
    const [isPregnant, setIsPregnant] = useState<boolean | undefined>(undefined);

    const [showPlanModal, setShowPlanModal] = useState(false);
    const [planModalMessage, setPlanModalMessage] = useState('');

    // استیت برای پیش‌نمایش بزرگ عکس ارسالی
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);
    const isFirstRun = useRef(true);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading, ageGenderForm]);

    // ارسال اولیه علائم و تصویر
    useEffect(() => {
        if ((requestPayload?.symptoms || requestPayload?.image) && isFirstRun.current) {
            isFirstRun.current = false;

            const initialText = requestPayload.symptoms?.trim() || (requestPayload.image ? 'تحلیل تصویر ارسال‌شده' : '');

            // اضافه کردن تصویر به آرایه پیام‌ها برای نمایش پیش‌نمایش
            setMessages([{
                role: 'user',
                content: initialText,
                image: requestPayload.image
            }]);

            startChatWithServer(initialText, requestPayload.image);
        }
    }, [requestPayload]);

    const handleCompleteResponse = (data: ChatResponse) => {
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: data.diagnosis?.diagnosis_description || 'تشخیص اولیه کامل شد.'
        }]);
        setFinalResult(data);
        setStatus('complete');
    };

    const handleDrugInfoResponse = (data: ChatResponse) => {
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'اطلاعات دارویی شما آماده است. لطفاً جزئیات زیر را مطالعه کنید.'
        }]);
        setFinalResult(data);
        setStatus('drug_info');
    };

    const handleIrrelevantImageResponse = (data: ChatResponse) => {
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: data.message || 'تصویر ارسال‌شده نامربوط است. لطفاً فقط تصویر واضح از دارو یا نسخه پزشکی ارسال کنید.'
        }]);
        setStatus('irrelevant_image');
    };

    const startChatWithServer = async (userMessage: string, imageBase64?: string) => {
        setLoading(true);
        setError(null);
        setStatus('chatting');

        try {
            const bodyPayload: any = {
                messages: [{ role: 'user', content: userMessage }],
                session_id: sessionId,
            };

            if (imageBase64) {
                bodyPayload.image = imageBase64;
            }

            const response = await fetch('https://api.mediraai.com/api/user/diagnosis/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(bodyPayload),
            });

            const json = await response.json();

            if (response.status === 400 && !json.success && json.data && 'daily_limit' in json.data) {
                setPlanModalMessage(json.message);
                setShowPlanModal(true);
                return;
            }

            if (!response.ok && response.status !== 400) throw new Error('خطا در دریافت پاسخ از سرور');

            const data = handleApiResponse(json);

            if (data.status === 'irrelevant_image') {
                handleIrrelevantImageResponse(data);
            } else if (data.status === 'need_more_info') {
                const message = data.message || '';
                const isAgeGenderQuestion = message.includes('سن') && message.includes('جنسیت');

                if (isAgeGenderQuestion) {
                    setAgeGenderForm('asking_who');
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: 'این مشاوره برای چه کسی است؟'
                    }]);
                } else {
                    setMessages(prev => [...prev, { role: 'assistant', content: message }]);
                }
            } else if (data.status === 'complete') {
                handleCompleteResponse(data);
            } else if (data.status === 'drug_info') {
                handleDrugInfoResponse(data);
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
            // تنها نقش و متن پیام برای بک‌اند ارسال می‌شود تا حجم تاریخچه سبک بماند
            const payloadMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

            const response = await fetch('https://api.mediraai.com/api/user/diagnosis/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ messages: payloadMessages, session_id: sessionId }),
            });

            const json = await response.json();

            if (response.status === 400 && !json.success && json.data && 'daily_limit' in json.data) {
                setPlanModalMessage(json.message);
                setShowPlanModal(true);
                return;
            }

            if (!response.ok && response.status !== 400) throw new Error('خطا در دریافت پاسخ از سرور');

            const data = handleApiResponse(json);

            if (data.status === 'irrelevant_image') {
                handleIrrelevantImageResponse(data);
            } else if (data.status === 'need_more_info') {
                const message = data.message || '';
                const isAgeGenderQuestion = message.includes('سن') && message.includes('جنسیت');

                if (isAgeGenderQuestion) {
                    setAgeGenderForm('asking_who');
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: 'این مشاوره برای چه کسی است؟'
                    }]);
                } else {
                    setMessages(prev => [...prev, { role: 'assistant', content: message }]);
                }
            } else if (data.status === 'complete') {
                handleCompleteResponse(data);
            } else if (data.status === 'drug_info') {
                handleDrugInfoResponse(data);
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

    const handleSelectPatientType = (type: 'me' | 'other') => {
        const isSwitching = ageGenderForm === 'waiting';
        setPatientType(type);

        const typeMessage: Message = {
            role: 'user',
            content: type === 'me' ? 'برای خودم' : 'برای دیگری'
        };

        if (type === 'me') {
            const hasAge = !!profile?.age;
            const hasGender = profile?.gender !== undefined && profile?.gender !== null;

            if (hasAge && hasGender) {
                const userGender = profile.gender === 0 ? 'male' : 'female';
                const userAge = profile.age.toString();

                let baseMessages = [...messages];
                if (isSwitching) {
                    baseMessages = baseMessages.slice(0, -2);
                }

                submitAgeGender(userAge, userGender, [...baseMessages, typeMessage]);
            } else {
                setMessages(prev => {
                    const newPrev = isSwitching ? prev.slice(0, -2) : prev;
                    return [...newPrev, typeMessage, {
                        role: 'assistant',
                        content: 'لطفاً سن و جنسیت خود را وارد کنید:'
                    }];
                });
                setAgeGenderForm('waiting');
            }
        } else {
            setMessages(prev => {
                const newPrev = isSwitching ? prev.slice(0, -2) : prev;
                return [...newPrev, typeMessage, {
                    role: 'assistant',
                    content: 'لطفاً سن و جنسیت بیمار را وارد کنید:'
                }];
            });
            setAgeGenderForm('waiting');
        }
    };

    const submitAgeGender = async (overrideAge?: string, overrideGender?: 'male' | 'female', previousMessages?: Message[]) => {
        const finalAge = overrideAge || age;
        const finalGender = overrideGender || gender;

        if (!finalAge.toString().trim() || !finalGender) {
            alert('لطفاً سن و جنسیت را وارد کنید.');
            return;
        }

        let userResponse = `سن: ${finalAge} سال، جنسیت: ${finalGender === 'male' ? 'مرد' : 'زن'}`;
        const ageNum = parseInt(finalAge);

        if (!overrideGender && finalGender === 'female' && ageNum >= 15 && ageNum <= 50) {
            if (isPregnant === undefined) {
                alert('لطفاً وضعیت بارداری را مشخص کنید.');
                return;
            }
            userResponse += `، وضعیت بارداری: ${isPregnant ? 'بله' : 'خیر'}`;
        }

        const baseMessages = previousMessages || messages;
        const newMessages = [...baseMessages, { role: 'user', content: userResponse }];

        setMessages(newMessages);
        setAgeGenderForm('submitted');
        setLoading(true);

        try {
            const payloadMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

            const response = await fetch('https://api.mediraai.com/api/user/diagnosis/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ messages: payloadMessages, session_id: sessionId }),
            });

            const json = await response.json();

            if (response.status === 400 && !json.success && json.data && 'daily_limit' in json.data) {
                setPlanModalMessage(json.message);
                setShowPlanModal(true);
                setAgeGenderForm('idle');
                return;
            }

            if (!response.ok && response.status !== 400) throw new Error('خطا در دریافت پاسخ از سرور');

            const data = handleApiResponse(json);

            if (data.status === 'need_more_info') {
                setMessages(prev => [...prev, { role: 'assistant', content: data.message || '' }]);
                setAgeGenderForm('idle');
            } else if (data.status === 'complete') {
                handleCompleteResponse(data);
            } else if (data.status === 'drug_info') {
                handleDrugInfoResponse(data);
            }
        } catch (err) {
            console.error(err);
            setError('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ متأسفانه در ارتباط با سرور مشکلی پیش آمد.'
            }]);
            setAgeGenderForm('idle');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if ((status !== 'complete' && status !== 'drug_info') || !finalResult) return;

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
        <div className="flex flex-col h-dvh bg-gradient-to-b from-blue-50 to-white mb-20" dir="rtl">
            <AppBar backTo="/symptoms" backState={symptomFormState} />

            <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-4 flex flex-col">
                <div className="flex-1 space-y-4 mb-4">
                    {messages.map((msg, idx) => {
                        const isLastAndDone = (status === 'complete' || status === 'drug_info') && idx === messages.length - 1;

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
                                    {/* نمایش تصویر ارسالی کاربر در صورت وجود */}
                                    {msg.image && (
                                        <div className="mb-2">
                                            <img
                                                src={msg.image.startsWith('data:') ? msg.image : `data:image/jpeg;base64,${msg.image}`}
                                                alt="تصویر ارسال شده"
                                                onClick={() => setPreviewImage(msg.image?.startsWith('data:') ? msg.image : `data:image/jpeg;base64,${msg.image}` || null)}
                                                className="w-48 max-w-full h-auto max-h-56 object-cover rounded-xl border border-white/20 shadow-sm cursor-pointer hover:opacity-95 transition-opacity"
                                            />
                                        </div>
                                    )}

                                    {isLastAndDone ? (
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

                    {/* پیام هشدار برای تصویر نامربوط همراه با دکمه بازگشت */}
                    {status === 'irrelevant_image' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 text-center">
                            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                                <ImageOff className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-1">تصویر مورد تایید نیست</h4>
                            <p className="text-sm text-gray-600 mb-4">
                                برای دریافت پاسخ دقیق، لطفاً فقط تصویر بسته دارویی، قرص یا نسخه پزشک را ارسال کنید.
                            </p>
                            <Button
                                onClick={() => navigate('/symptoms', { state: symptomFormState })}
                                className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                ارسال مجدد تصویر یا شرح علائم
                            </Button>
                        </div>
                    )}

                    {ageGenderForm === 'asking_who' && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <UserCircle className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="font-medium text-gray-800">این مشاوره برای چه کسی است؟</h3>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <Button
                                    onClick={() => handleSelectPatientType('me')}
                                    className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-none"
                                >
                                    برای خودم
                                </Button>
                                <Button
                                    onClick={() => handleSelectPatientType('other')}
                                    className="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-none"
                                >
                                    برای دیگری
                                </Button>
                            </div>
                        </div>
                    )}

                    {ageGenderForm === 'waiting' && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                            <div className="flex bg-gray-100 p-1 rounded-xl mb-5">
                                <button
                                    onClick={() => patientType !== 'me' && handleSelectPatientType('me')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${patientType === 'me' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    برای خودم
                                </button>
                                <button
                                    onClick={() => patientType !== 'other' && handleSelectPatientType('other')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${patientType === 'other' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    برای دیگری
                                </button>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <UserCircle className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="font-medium text-gray-800">
                                    {patientType === 'me' ? 'لطفاً اطلاعات خود را تکمیل کنید:' : 'لطفاً اطلاعات بیمار را تکمیل کنید:'}
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">سن (سال)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="مثال: 30"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">جنسیت</label>
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

                                {gender === 'female' && parseInt(age) >= 15 && parseInt(age) <= 50 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">آیا بیمار باردار است؟</label>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setIsPregnant(true)}
                                                className={`flex-1 py-2 px-4 rounded-lg border ${isPregnant === true
                                                    ? 'bg-green-50 border-green-500 text-green-700'
                                                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                بله
                                            </button>
                                            <button
                                                onClick={() => setIsPregnant(false)}
                                                className={`flex-1 py-2 px-4 rounded-lg border ${isPregnant === false
                                                    ? 'bg-red-50 border-red-500 text-red-700'
                                                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                خیر
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={() => submitAgeGender()}
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

                    {loading && status !== 'complete' && status !== 'drug_info' && ageGenderForm !== 'waiting' && ageGenderForm !== 'asking_who' && (
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

                {status === 'chatting' && !loading && ageGenderForm === 'idle' && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-2 flex gap-2 shadow-sm shrink-0 animate-in fade-in slide-in-from-bottom-2">
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

                {status === 'complete' && finalResult && (
                    <div className={`transition-all duration-700 shrink-0 ${!showContent ? 'blur-md opacity-0 pointer-events-none translate-y-4' : 'blur-0 opacity-100 translate-y-0'}`}>
                        <div className="space-y-5 mb-5">
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
                                                        const ttl = 5 * 60 * 1000;
                                                        const now = new Date().getTime();
                                                        sessionStorage.setItem('diagnosis_doctor_context_' + doctor.id, JSON.stringify({
                                                            doctor_id: doctor.id,
                                                            session_id: sessionId,
                                                            source: 'diagnosis',
                                                            expiry: now + ttl
                                                        }));
                                                        window.open(`/doctor/${doctor.id}`, '_blank');
                                                    }}
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

                {/* بخش نمایش اطلاعات دارویی */}
                {status === 'drug_info' && finalResult && finalResult.drug_details && (
                    <div className={`transition-all duration-700 shrink-0 ${!showContent ? 'blur-md opacity-0 pointer-events-none translate-y-4' : 'blur-0 opacity-100 translate-y-0'}`}>
                        <div className="mb-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            {finalResult.drug_names && finalResult.drug_names.length > 0 && (
                                <div className="mb-5">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-3">داروهای مورد نظر شما:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {finalResult.drug_names.map((name, i) => (
                                            <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-sm font-medium border border-blue-100">
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4 text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div>
                                    <strong className="block text-gray-800 mb-1 text-base">توضیحات:</strong>
                                    <p className="text-gray-600">{finalResult.drug_details.description}</p>
                                </div>
                                <div className="h-px bg-gray-200 my-2"></div>
                                <div>
                                    <strong className="block text-red-700 mb-1 text-base">عوارض جانبی احتمالی:</strong>
                                    <p className="text-gray-600">{finalResult.drug_details.side_effects}</p>
                                </div>
                                <div className="h-px bg-gray-200 my-2"></div>
                                <div>
                                    <strong className="block text-green-700 mb-1 text-base">نحوه مصرف و دوز (عمومی):</strong>
                                    <p className="text-gray-600">{finalResult.drug_details.usage_and_dosage}</p>
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-start gap-2">
                                <span className="font-bold shrink-0">⚠️ توجه:</span>
                                <span>این اطلاعات تنها جنبه راهنمایی دارند و به هیچ وجه جایگزین توصیه پزشک یا دکتر داروساز نیستند. در صورت داشتن بیماری زمینه‌ای، پیش از مصرف حتماً با پزشک مشورت کنید.</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* مودال بزرگ‌نمایی تصویر (Image Lightbox) */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-2xl max-h-[90vh] flex flex-col items-center">
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-10 left-0 p-2 text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={previewImage}
                            alt="تصویر بزرگ‌نمایی شده"
                            className="w-auto h-auto max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* مودال محدودیت پلن */}
            {showPlanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
                                <Crown className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">ارتقا پلن کاربری</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                {planModalMessage || 'محدودیت درخواست روزانه به پایان رسید. برای دسترسی بیشتر پلن خود را ارتقا دهید.'}
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowPlanModal(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                >
                                    انصراف
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowPlanModal(false);
                                        navigate('/plans');
                                    }}
                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                                >
                                    مشاهده پلن‌ها
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
