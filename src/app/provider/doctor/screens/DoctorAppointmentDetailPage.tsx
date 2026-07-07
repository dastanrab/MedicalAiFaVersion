import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
    ArrowRight,
    Calendar,
    Clock,
    Phone,
    User,
    FileText,
    Activity,
    MessageSquare,
    Save,
    CheckCircle,
    Loader
} from 'lucide-react';
import {DoctorAppointmentStatus} from "../data/mockDoctorData";
import {useDoctorAuthStore} from "../store/doctorAuthStore";
import {doctorAppointmentStatusLabels, doctorAppointmentStatusStyles} from "../../config/statusOptions";
import {StatusBadge} from "../../components";


const API_BASE_URL = 'http://185.222.163.113:7000/api';

interface AiDiagnosisDetail {
    notes: string;
    status: string;
    diagnosis: string[];
    red_flags: string[];
    specialty: {
        primary: string;
        secondary: string[];
        recommended_specialist: string;
    };
    urgency_level: string;
    lifestyle_changes: string[];
    recommended_tests: string[];
    diagnosis_description: string;
    recommended_exercises: string[];
}

interface ApiAiDiagnosis {
    session_id: string;
    created_at: string;
    diagnosis: AiDiagnosisDetail | null;  // ← قبلاً string | null بود
    urgency_level: string | null;
    specialty: { primary?: string; recommended_specialist?: string } | null;
    recommended_tests: string[];
    notes: string | null;
    messages: ApiAiMessage[];
}

interface ApiAppointment {
    id: number;
    patient_id: number;
    patient_name: string;
    patient_phone: string;
    slot_date: string;
    start_time: string;
    end_time: string;
    status: DoctorAppointmentStatus;
    notes: string | null;
}

interface ApiPatient {
    id: number;
    name: string;
    phone: string;
    age: number | null;
    visit_count: number;
}

interface ApiHistory {
    slot_date: string;
    start_time: string;
    status: DoctorAppointmentStatus;
    notes: string | null;
}

interface ApiAiMessage {
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

interface ApiAiDiagnosis {
    session_id: string;
    created_at: string;
    diagnosis: string | null;
    urgency_level: string | null;
    specialty: { primary?: string; recommended_specialist?: string } | null;
    recommended_tests: string[];
    notes: string | null;
    messages: ApiAiMessage[];
}

interface ApiResponse {
    status: boolean;
    data: {
        appointment: ApiAppointment;
        patient: ApiPatient;
        history: ApiHistory[];
        ai_diagnosis: ApiAiDiagnosis | null;
    };
    message?: string;
}

export default function DoctorAppointmentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useDoctorAuthStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [marking, setMarking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [appointment, setAppointment] = useState<ApiAppointment | null>(null);
    const [patient, setPatient] = useState<ApiPatient | null>(null);
    const [history, setHistory] = useState<ApiHistory[]>([]);
    const [aiDiagnosis, setAiDiagnosis] = useState<ApiAiDiagnosis | null>(null);

    const [visitNotes, setVisitNotes] = useState('');
    const [showAiChat, setShowAiChat] = useState(false);

    useEffect(() => {
        if (!id || !token) return;
        fetchAppointmentDetail();
    }, [id, token]);

    const fetchAppointmentDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/doctor/appointments/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json: ApiResponse = await res.json();
            if (!res.ok || !json.status) {
                throw new Error(json.message || 'خطا در دریافت جزئیات نوبت');
            }
            setAppointment(json.data.appointment);
            setPatient(json.data.patient);
            setHistory(json.data.history);
            setAiDiagnosis(json.data.ai_diagnosis);
            setVisitNotes(json.data.appointment.notes || '');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!visitNotes.trim()) {
            alert('لطفاً نتیجه ویزیت را وارد کنید');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/doctor/appointments/${id}/notes`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notes: visitNotes }),
            });
            const json = await res.json();
            if (!res.ok || !json.status) {
                throw new Error(json.message || 'خطا در ذخیره نتیجه ویزیت');
            }
            alert('نتیجه ویزیت با موفقیت ذخیره شد');
            fetchAppointmentDetail();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleMarkAsDone = async () => {
        if (!confirm('آیا مطمئن هستید که این نوبت به اتمام رسیده؟')) return;
        setMarking(true);
        try {
            const res = await fetch(`${API_BASE_URL}/doctor/appointments/${id}/mark-done`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!res.ok || !json.status) {
                throw new Error(json.message || 'خطا در تغییر وضعیت نوبت');
            }
            alert('وضعیت نوبت به ویزیت شده تغییر یافت');
            fetchAppointmentDetail();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setMarking(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        );
    }

    if (error || !appointment || !patient) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    {error || 'نوبت یافت نشد'}
                </div>
                <Link to="/provider/doctor/appointments" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
                    بازگشت به لیست نوبت‌ها
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/provider/doctor/appointments')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">جزئیات نوبت</h1>
                </div>
                {appointment.status === 'booked' && (
                    <button
                        onClick={handleMarkAsDone}
                        disabled={marking}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <CheckCircle className="w-4 h-4" />
                        {marking ? 'در حال ثبت...' : 'تکمیل ویزیت'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* اطلاعات نوبت */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-slate-900">اطلاعات نوبت</h2>
                            <StatusBadge
                                label={doctorAppointmentStatusLabels[appointment.status]}
                                className={doctorAppointmentStatusStyles[appointment.status]}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 text-slate-700">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-500">تاریخ</p>
                                    <p className="font-medium">{appointment.slot_date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-700">
                                <Clock className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-500">ساعت</p>
                                    <p className="font-medium">{appointment.start_time}</p>
                                </div>
                            </div>
                        </div>

                        {aiDiagnosis && (
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <button
                                    onClick={() => setShowAiChat(!showAiChat)}
                                    className="flex items-center justify-between w-full text-right"
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-blue-600" />
                                        <span className="font-medium text-blue-900">پیش‌تشخیص هوش مصنوعی</span>
                                    </div>
                                    <span className="text-sm text-blue-600">{showAiChat ? 'بستن' : 'نمایش'}</span>
                                </button>

                                {!showAiChat && (
                                    <div className="mt-3 space-y-2text-sm">
                                        {aiDiagnosis.diagnosis?.diagnosis && aiDiagnosis.diagnosis.diagnosis.length > 0 && (
                                            <p>
                                                <span className="text-slate-600">تشخیص:</span>{' '}
                                                <span className="font-medium">{aiDiagnosis.diagnosis.diagnosis.join('، ')}</span>
                                            </p>
                                        )}
                                        {aiDiagnosis.urgency_level && (
                                            <p>
                                                <span className="text-slate-600">سطح فوریت:</span>{' '}
                                                <span className="font-medium">{aiDiagnosis.urgency_level}</span>
                                            </p>
                                        )}
                                        {aiDiagnosis.specialty?.primary && (
                                            <p>
                                                <span className="text-slate-600">تخصص:</span>{' '}
                                                <span className="font-medium">{aiDiagnosis.specialty.primary}</span>
                                            </p>
                                        )}
                                        {aiDiagnosis.diagnosis?.diagnosis_description && (
                                            <p className="text-slate-600 text-xs mt-2">{aiDiagnosis.diagnosis.diagnosis_description}</p>
                                        )}
                                    </div>
                                )}


                                {showAiChat && (
                                    <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                                        {aiDiagnosis.messages.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-3 rounded-lg ${
                                                    msg.role === 'user'
                                                        ? 'bg-white border border-slate-200 mr-8'
                                                        : 'bg-blue-100 ml-8'
                                                }`}
                                            >
                                                <p className="text-xs text-slate-500 mb-1">{msg.role === 'user' ? 'بیمار' : 'دستیار AI'}</p>
                                                <p className="text-sm text-slate-800 whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        ))}
                                        {aiDiagnosis.notes && (
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                <p className="text-xs text-amber-700 mb-1">یادداشت نهایی</p>
                                                <p className="text-sm text-slate-800">{aiDiagnosis.notes}</p>
                                            </div>
                                        )}
                                        {aiDiagnosis.recommended_tests.length > 0 && (
                                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <p className="text-xs text-green-700 mb-2">آزمایشات پیشنهادی</p>
                                                <ul className="text-sm text-slate-800 list-disc list-inside space-y-1">
                                                    {aiDiagnosis.recommended_tests.map((test, i) => (
                                                        <li key={i}>{test}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* فرم نتیجه ویزیت */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-slate-400" />
                            <h2 className="text-lg font-semibold text-slate-900">نتیجه ویزیت</h2>
                        </div>
                        <textarea
                            value={visitNotes}
                            onChange={(e) => setVisitNotes(e.target.value)}
                            placeholder="توضیحات، تشخیص، و دستورات درمانی را وارد کنید..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={6}
                            disabled={appointment.status === 'done'}
                        />
                        {appointment.status !== 'done' && (
                            <button
                                onClick={handleSaveNotes}
                                disabled={saving}
                                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'در حال ذخیره...' : 'ذخیره نتیجه'}
                            </button>
                        )}
                    </div>

                    {/* سابقه مراجعه */}
                    {history.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-5 h-5 text-slate-400" />
                                <h2 className="text-lg font-semibold text-slate-900">سابقه مراجعه هم‌تخصصی</h2>
                            </div>
                            <div className="space-y-3">
                                {history.map((visit, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                                <span>{visit.slot_date}</span>
                                                <span>{visit.start_time}</span>
                                            </div>
                                            <StatusBadge
                                                label={doctorAppointmentStatusLabels[visit.status]}
                                                className={doctorAppointmentStatusStyles[visit.status]}
                                            />
                                        </div>
                                        {visit.notes && (
                                            <p className="text-sm text-slate-700 mt-2">{visit.notes}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* اطلاعات بیمار */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
                        <div className="flex items-center gap-2 mb-6">
                            <User className="w-5 h-5 text-slate-400" />
                            <h2 className="text-lg font-semibold text-slate-900">اطلاعات بیمار</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">نام</p>
                                <p className="font-medium text-slate-900">{patient.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <a href={`tel:${patient.phone}`} className="text-blue-600 hover:text-blue-700">
                                    {patient.phone}
                                </a>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">سن</p>
                                    <p className="text-2xl font-bold text-slate-900">{patient.age ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">تعداد ویزیت</p>
                                    <p className="text-2xl font-bold text-slate-900">{patient.visit_count}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
