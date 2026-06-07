import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Send, ArrowRight, Stethoscope, Calendar } from 'lucide-react';

const API_BASE = 'http://185.222.163.113:8000';

interface Message {
    role: 'user' | 'assistant';
    text: string;
    doctors?: Doctor[];
}
interface Doctor { id: number; name: string; specialty: string; rating: string }
interface ChatResponse {
    status: 'need_more_info' | 'complete';
    message?: string;
    diagnosis?: {
        specialty?: { primary?: string; recommended_specialist?: string };
        urgency_level?: string;
        diagnosis?: string[];
        diagnosis_description?: string;
        recommended_tests?: string[];
        red_flags?: string[];
        notes?: string;
    };
    emergency_contacts?: string[];
    updated_history: { role: string; content: string }[];
}

const MOCK_DOCTORS: Record<string, Doctor[]> = {
    default: [
        { id: 1, name: 'دکتر سارا احمدی', specialty: 'متخصص', rating: '۴.۸' },
        { id: 2, name: 'دکتر علی رضایی', specialty: 'متخصص', rating: '۴.۶' },
        { id: 3, name: 'دکتر مریم کریمی', specialty: 'متخصص', rating: '۴.۷' },
    ],
};

function getDoctors(specialty: string): Doctor[] {
    const base = MOCK_DOCTORS[specialty] ?? MOCK_DOCTORS.default;
    return base.map(d => ({ ...d, specialty }));
}

function buildDiagnosisText(d: NonNullable<ChatResponse['diagnosis']>): string {
    console.log(d)
    const lines: string[] = [];
    if (d.diagnosis_description) lines.push(d.diagnosis_description);
    if (d.notes) lines.push(`\n💡 ${d.notes}`);
    return lines.join('\n');
}

export default function MedicalChat() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
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
        setMessages(prev => [...prev, { role: 'user', text }]);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptoms: text, history }),
            });
            const data: ChatResponse = await res.json();
            setHistory(data.updated_history);
            if (data.emergency_contacts) setEmergency(data.emergency_contacts);

            if (data.status === 'need_more_info') {
                setMessages(prev => [...prev, { role: 'assistant', text: data.message ?? '' }]);
                setLoading(false);
                inputRef.current?.focus();
            } else {
                const diag = data.diagnosis ?? {};
                const fullText = buildDiagnosisText(diag);
                const specialist = diag.specialty?.recommended_specialist ?? diag.specialty?.primary ?? 'متخصص';
                const doctors = getDoctors(specialist);
                setLoading(false);
                typeText(fullText, doctors, () => inputRef.current?.focus());
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ خطا در ارتباط با سرور.' }]);
            setLoading(false);
            inputRef.current?.focus();
        }
    }

    return (
        <div className="flex flex-col h-dvh bg-[#0f1117]" dir="rtl">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1d27] border-b border-white/10 shrink-0">
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white leading-none">دستیار پزشکی</p>
                        <p className="text-xs text-green-400 mt-0.5">آنلاین</p>
                    </div>
                </div>
            </div>

            {emergency && (
                <div className="mx-3 mt-3 rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-2.5 text-center text-sm font-bold text-red-400 animate-pulse shrink-0">
                    🚨 {emergency.join(' | ')}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 && !isTyping && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
                        <div className="w-16 h-16 rounded-full bg-[#1a1d27] flex items-center justify-center">
                            <Stethoscope className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-sm">علائم خود را شرح دهید</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className="space-y-3">
                        <div className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center ml-2 shrink-0 self-end mb-1">
                                    <Stethoscope className="w-3.5 h-3.5 text-white" />
                                </div>
                            )}
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-7 whitespace-pre-wrap ${
                                msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-[#1a1d27] text-gray-200 rounded-bl-sm border border-white/10'
                            }`}>
                                {msg.text}
                            </div>
                        </div>

                        {/* Doctor Cards */}
                        {msg.doctors && (
                            <div className="space-y-2 pr-9">
                                <p className="text-xs text-gray-500 px-1">پزشکان پیشنهادی ({msg.doctors[0]?.specialty}):</p>
                                {msg.doctors.map(doc => (
                                    <div key={doc.id} className="bg-[#1a1d27] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-white">{doc.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{doc.specialty} · ⭐ {doc.rating}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/reserve/${doc.id}`)}
                                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
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
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center ml-2 shrink-0 self-end mb-1">
                            <Stethoscope className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="max-w-[80%] bg-[#1a1d27] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-7 whitespace-pre-wrap text-gray-200">
                            {typingText}
                            <span className="inline-block w-0.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-middle" />
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-end">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center ml-2 shrink-0">
                            <Stethoscope className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="bg-[#1a1d27] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                            <span className="flex gap-1 items-center h-5">
                                {[0, 1, 2].map(i => (
                                    <span key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 bg-[#0f1117] border-t border-white/10 shrink-0">
                <div className="flex gap-2 items-center bg-[#1a1d27] rounded-2xl border border-white/10 px-4 py-2">
                    <input
                        ref={inputRef}
                        className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none text-right"
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
                        className="w-8 h-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors shrink-0"
                    >
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </div>
                <p className="mt-2 text-center text-xs text-gray-600">این ابزار جایگزین مراجعه به پزشک نیست.</p>
            </div>
        </div>
    );
}
