import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Send, ArrowRight, Stethoscope, Calendar } from 'lucide-react';
import {useAuthStore} from "../store/authStore";

const API_URL = 'http://185.222.163.113:7000/api/user/diagnosis/chat';

interface Message {
    role: 'user' | 'assistant';
    text: string;
    doctors?: Doctor[];
}

interface Doctor {
    id: number;
    name: string;
    rating: number;
    visit_price?: number;
    image_url?: string;
    specialty_name?: string;
}

interface ChatResponse {
    status: 'need_more_info' | 'complete';
    message?: string;
    diagnosis?: {
        specialty?: { primary?: string; recommended_specialist?: string; specialty_name_fa?: string };
        urgency_level?: string;
        diagnosis?: string[];
        diagnosis_description?: string;
        recommended_tests?: string[];
        red_flags?: string[];
        notes?: string;
    };
    specialty?: { specialty_id: number; specialty_name_fa: string }; // اضافه شد
    recommended_doctors?: Doctor[]; // به این سطح منتقل شد
    emergency_contacts?: string[];
    updated_history: { role: string; content: string }[];
}


function buildDiagnosisText(d: NonNullable<ChatResponse['diagnosis']>): string {
    const lines: string[] = [];
    if (d.diagnosis_description) lines.push(d.diagnosis_description);
    if (d.notes) lines.push(`\n💡 ${d.notes}`);
    return lines.join('\n');
}

export default function MedicalChatV1() {
    const accessToken = useAuthStore((state) => state.accessToken);
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [emergency, setEmergency] = useState<string[] | null>(null);
    const [typingText, setTypingText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading, typingText]);

    function typeText(fullText: string, doctors: Doctor[] | undefined, onDone: () => void) {
        setIsTyping(true);
        setTypingText('');
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setTypingText(fullText.slice(0, i));
            if (i >= fullText.length) {
                clearInterval(interval);
                setIsTyping(false);
                setTypingText('');
                setMessages(prev => [...prev, { role: 'assistant', text: fullText, doctors }]);
                onDone();
            }
        }, 18);
    }

    async function send() {
        if (!input.trim() || loading || isTyping) return;
        const text = input.trim();
        setInput('');

        const newMessages: Message[] = [...messages, { role: 'user', text }];
        setMessages(newMessages);
        setLoading(true);

        const payloadMessages = newMessages.map(msg => ({
            role: msg.role,
            content: msg.text
        }));

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ messages: payloadMessages }),
            });

            const json = await res.json();

            if (!json.success) throw new Error(json.message || 'Error parsing response');

            const data: ChatResponse = json.data;

            if (data.emergency_contacts) setEmergency(data.emergency_contacts);

            if (data.status === 'need_more_info') {
                setMessages(prev => [...prev, { role: 'assistant', text: data.message ?? '' }]);
                setLoading(false);
                inputRef.current?.focus();
            } else {
                const diag = data.diagnosis ?? {};
                const fullText = buildDiagnosisText(diag);

                // تغییر: خواندن پزشکان از سطح اصلی data
                const backendDoctors = data.recommended_doctors ?? [];

                // تغییر: خواندن نام تخصص از سطح اصلی data (یا در صورت نبود از داخل diagnosis)
                const specialtyName = data.specialty?.specialty_name_fa ??
                    diag.specialty?.specialty_name_fa ??
                    'متخصص';

                const doctorsToDisplay = backendDoctors.map(doc => ({
                    ...doc,
                    specialty_name: specialtyName
                }));

                setLoading(false);
                typeText(fullText, doctorsToDisplay, () => inputRef.current?.focus());
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ خطا در ارتباط با سرور.' }]);
            setLoading(false);
            inputRef.current?.focus();
        }
    }

    return (
        <div className="flex flex-col h-dvh bg-slate-50" dir="rtl">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 leading-none">دستیار پزشکی</p>
                        <p className="text-xs text-green-600 mt-0.5 font-medium">آنلاین</p>
                    </div>
                </div>
            </div>

            {emergency && (
                <div className="mx-3 mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-center text-sm font-bold text-red-600 animate-pulse shrink-0">
                    🚨 {emergency.join(' | ')}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 && !isTyping && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                        <div className="w-16 h-16 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                            <Stethoscope className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-sm font-medium">علائم خود را شرح دهید</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className="space-y-3">
                        <div className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center ml-2 shrink-0 self-end mb-1 shadow-sm">
                                    <Stethoscope className="w-3.5 h-3.5 text-white" />
                                </div>
                            )}
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-7 whitespace-pre-wrap shadow-sm ${
                                msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                            }`}>
                                {msg.text}
                            </div>
                        </div>

                        {/* Doctor Cards */}
                        {msg.doctors && msg.doctors.length > 0 && (
                            <div className="space-y-2 pr-9">
                                <p className="text-xs font-medium text-gray-500 px-1">پزشکان پیشنهادی ({msg.doctors[0]?.specialty_name}):</p>
                                {msg.doctors.map(doc => (
                                    <div key={doc.id} className="bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {doc.image_url ? (
                                                <img src={doc.image_url} alt={doc.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <Stethoscope className="w-5 h-5 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{doc.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">⭐ {doc.rating}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/reserve/${doc.id}`)}
                                            className="flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-xs px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <Calendar className="w-3.5 h-3.5" />
                                            رزرو
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing animation */}
                {isTyping && (
                    <div className="flex justify-end">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center ml-2 shrink-0 self-end mb-1 shadow-sm">
                            <Stethoscope className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="max-w-[80%] bg-white border border-gray-200 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-7 whitespace-pre-wrap text-gray-800">
                            {typingText}
                            <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-middle" />
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-end">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center ml-2 shrink-0 shadow-sm">
                            <Stethoscope className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
                            <span className="flex gap-1 items-center h-5">
                                {[0, 1, 2].map(i => (
                                    <span key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 bg-slate-50 shrink-0">
                <div className="flex gap-2 items-center bg-white rounded-2xl border border-gray-300 shadow-sm px-4 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                    <input
                        ref={inputRef}
                        className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none text-right"
                        placeholder="پیام خود را بنویسید..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && send()}
                        disabled={loading || isTyping}
                        dir="rtl"
                    />
                    <button
                        onClick={send}
                        disabled={loading || isTyping || !input.trim()}
                        className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors shrink-0 shadow-sm"
                    >
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </div>
                <p className="mt-2 text-center text-xs text-gray-500 font-medium">این ابزار جایگزین مراجعه به پزشک نیست.</p>
            </div>
        </div>
    );
}
