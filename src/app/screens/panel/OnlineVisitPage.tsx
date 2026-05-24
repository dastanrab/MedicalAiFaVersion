// OnlineVisitPage.tsx
import { useState } from 'react';
import {
    Video, Phone, Mic, MicOff, Camera, CameraOff, MessageCircle,
    UserPlus, Clock, CheckCircle, XCircle, Users, Calendar,
    ArrowLeft, MoreVertical, ScreenShare, Settings, ThumbsUp
} from 'lucide-react';

interface OnlineVisit {
    id: string;
    patientName: string;
    patientId: string;
    scheduledTime: string;
    status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
    chiefComplaint?: string;
    duration?: string;
}

const upcomingVisits: OnlineVisit[] = [
    {
        id: 'ov1',
        patientName: 'سارا محمدی',
        patientId: 'P-101',
        scheduledTime: '۱۴۰۵/۰۳/۰۳ - ۰۹:۳۰',
        status: 'waiting',
        chiefComplaint: 'سردرد مزمن',
    },
    {
        id: 'ov2',
        patientName: 'امیر حسینی',
        patientId: 'P-102',
        scheduledTime: '۱۴۰۵/۰۳/۰۳ - ۱۰:۱۵',
        status: 'waiting',
        chiefComplaint: 'مشاوره تغذیه',
    },
    {
        id: 'ov3',
        patientName: 'نرگس رضایی',
        patientId: 'P-103',
        scheduledTime: '۱۴۰۵/۰۳/۰۳ - ۱۱:۰۰',
        status: 'waiting',
        chiefComplaint: 'پیگیری جواب آزمایش',
    },
    {
        id: 'ov4',
        patientName: 'فرهاد کریمی',
        patientId: 'P-104',
        scheduledTime: '۱۴۰۵/۰۳/۰۳ - ۱۲:۳۰',
        status: 'waiting',
        chiefComplaint: 'کمردرد',
    },
];

const statusConfig: Record<OnlineVisit['status'], { label: string; color: string; icon: any }> = {
    'waiting': { label: 'در انتظار', color: 'bg-amber-100 text-amber-700', icon: Clock },
    'in-progress': { label: 'در حال ویزیت', color: 'bg-blue-100 text-blue-700', icon: Video },
    'completed': { label: 'انجام شده', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    'cancelled': { label: 'لغو شده', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function OnlineVisitPage() {
    const [activeCall, setActiveCall] = useState<OnlineVisit | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [showChat, setShowChat] = useState(false);

    const startVisit = (visit: OnlineVisit) => {
        setActiveCall({ ...visit, status: 'in-progress' });
        // Reset controls for new call
        setIsMuted(false);
        setIsCameraOff(false);
        setShowChat(false);
    };

    const endVisit = () => {
        if (activeCall) {
            // In a real app, mark as completed via API
            setActiveCall(null);
            // Reset states
            setIsMuted(false);
            setIsCameraOff(false);
            setShowChat(false);
        }
    };

    const waitingCount = upcomingVisits.filter(v => v.status === 'waiting').length;
    const inProgressCount = activeCall ? 1 : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">ویزیت آنلاین</h1>
                    <p className="text-sm text-gray-500 mt-1">مدیریت جلسات ویزیت مجازی با بیماران</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
                    <UserPlus className="w-4 h-4" />
                    دعوت به ویزیت فوری
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">در صف انتظار</p>
                        <p className="text-lg font-bold text-gray-800">{waitingCount} بیمار</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                        <Video className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">ویزیت فعال</p>
                        <p className="text-lg font-bold text-gray-800">{inProgressCount} جلسه</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">نوبت‌های امروز</p>
                        <p className="text-lg font-bold text-gray-800">{upcomingVisits.length} نوبت</p>
                    </div>
                </div>
            </div>

            {/* Active Call or Upcoming Queue */}
            {activeCall ? (
                <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                    {/* Call Controls Bar */}
                    <div className="flex items-center justify-between px-6 py-3 bg-gray-800/90 backdrop-blur">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={endVisit}
                                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Phone className="w-4 h-4 rotate-135" />
                                پایان ویزیت
                            </button>
                            <div className="h-6 w-px bg-gray-600"></div>
                            <div className="text-right text-white">
                                <p className="text-sm font-medium">{activeCall.patientName}</p>
                                <p className="text-xs text-gray-400">پرونده {activeCall.patientId}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowChat(!showChat)}
                                className={`p-2 rounded-lg transition-colors ${showChat ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                            >
                                <MessageCircle className="w-5 h-5" />
                            </button>
                            <button
                                className={`p-2 rounded-lg transition-colors ${isMuted ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                                onClick={() => setIsMuted(!isMuted)}
                            >
                                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                            <button
                                className={`p-2 rounded-lg transition-colors ${isCameraOff ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                                onClick={() => setIsCameraOff(!isCameraOff)}
                            >
                                {isCameraOff ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                            </button>
                            <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                                <ScreenShare className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Video Area */}
                    <div className="grid grid-cols-5 gap-4 p-4 min-h-[480px]">
                        {/* Main screen: Patient video placeholder */}
                        <div className={`${showChat ? 'col-span-3' : 'col-span-4'} relative bg-gray-800 rounded-xl flex items-center justify-center`}>
                            <div className="text-center text-gray-500">
                                <Camera className="w-16 h-16 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">ویدیوی بیمار</p>
                                <p className="text-xs text-gray-600">دوربین بیمار {isCameraOff ? 'خاموش' : 'روشن'}</p>
                            </div>
                            {isCameraOff && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-xl">
                                    <CameraOff className="w-12 h-12 text-red-400" />
                                </div>
                            )}

                            {/* Doctor's self-view thumbnail (PiP) */}
                            <div className="absolute bottom-4 right-4 w-40 h-28 bg-gray-700 rounded-lg border-2 border-gray-600 overflow-hidden flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                    <Camera className="w-6 h-6 mx-auto mb-1" />
                                    <p className="text-xs">شما</p>
                                    {isMuted && <MicOff className="w-3 h-3 mx-auto mt-1 text-red-400" />}
                                </div>
                            </div>
                        </div>

                        {/* Chat Panel (togglable) */}
                        {showChat && (
                            <div className="col-span-2 bg-gray-800 rounded-xl flex flex-col">
                                <div className="p-3 border-b border-gray-700">
                                    <p className="text-sm font-medium text-white">گفتگوی متنی</p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                    <div className="flex justify-end">
                                        <div className="max-w-[80%] bg-blue-600 text-white text-xs px-3 py-2 rounded-lg rounded-bl-none">
                                            سلام، وقت بخیر. آماده‌اید؟
                                        </div>
                                    </div>
                                    <div className="flex justify-start">
                                        <div className="max-w-[80%] bg-gray-700 text-white text-xs px-3 py-2 rounded-lg rounded-br-none">
                                            بله، سلام. آماده‌ام.
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 border-t border-gray-700 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="پیام خود را بنویسید..."
                                        className="flex-1 bg-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                                    />
                                    <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        <ThumbsUp className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Upcoming Visits Queue */
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-700">صف انتظار ویزیت‌های آنلاین</h2>
                        <span className="text-xs text-gray-500">{waitingCount} بیمار در صف</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {upcomingVisits.filter(v => v.status === 'waiting').map(visit => {
                            const StatusIcon = statusConfig[visit.status].icon;
                            return (
                                <div key={visit.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">
                                            {visit.patientName.charAt(0)}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-800">{visit.patientName}</p>
                                            <p className="text-xs text-gray-500">{visit.patientId} • {visit.chiefComplaint}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {visit.scheduledTime}
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[visit.status].color}`}>
                      <StatusIcon className="w-3 h-3" />
                                            {statusConfig[visit.status].label}
                    </span>
                                        <button
                                            onClick={() => startVisit(visit)}
                                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <Video className="w-3.5 h-3.5" />
                                            شروع ویزیت
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {upcomingVisits.filter(v => v.status === 'waiting').length === 0 && (
                            <div className="p-8 text-center text-gray-400">
                                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>همه بیماران ویزیت شده‌اند</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
