import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import {
  Star,
  MapPin,
  Clock,
  Award,
  Wallet,
  Video,
  MessageSquare,
  Calendar,
  CheckCircle,
  Briefcase,
  Heart,
  Loader2,
  CreditCard,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuthStore } from "../store/authStore";
import { AppBar } from '../components/AppBar';
import { PageLoader } from '../components/PageLoader';

interface DoctorData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  gender: number;
  specialty_id: number;
  specialty_name: string;
  visit_price: number;
  experience: string;
  address: string;
  rating: string;
  visit_count: number;
  image_url: string;
  is_vip: boolean;
  bio: string;
  lat: number | null;
  lng: number | null;
  appointments: number;
  medical_code: string | null;
  rank: number | null;
  reviews: number;
  recommendation: number;
  city: string | null;
  province: string | null;
  tags: string[];
}

interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  datetime: string;
  status: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    doctor: DoctorData;
    available_slots: Record<string, TimeSlot[]>;
    stats: {
      total_slots: number;
      available_days: number;
      date_range: {
        start: string;
        end: string;
      };
    };
  };
}

export function DoctorProfile() {
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // وضعیت‌های داده‌ای
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [recommenders, setRecommenders] = useState<any[]>([]);
  const [isRecommendedByMe, setIsRecommendedByMe] = useState(false);
  const [isTogglingRecommendation, setIsTogglingRecommendation] = useState(false);
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Record<string, TimeSlot[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  // وضعیت‌های مربوط به رزرو و پرداخت
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<'saman' >('saman');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    let currentSessionId = location.state?.sessionId || null;
    let timer: NodeJS.Timeout;

    if (!currentSessionId) {
      const contextStr = sessionStorage.getItem('diagnosis_doctor_context_' + id);

      if (contextStr) {
        try {
          const parsedData = JSON.parse(contextStr);
          const now = new Date().getTime();
          if (parsedData.expiry && now > parsedData.expiry) {
            sessionStorage.removeItem('diagnosis_doctor_context_' + id);
          } else {
            currentSessionId = parsedData.sessionId;

            if (parsedData.expiry) {
              const initialTimeLeft = Math.floor((parsedData.expiry - now) / 1000);
              setTimeLeft(initialTimeLeft);

              timer = setInterval(() => {
                const currentTime = new Date().getTime();
                const remaining = Math.floor((parsedData.expiry - currentTime) / 1000);

                if (remaining <= 0) {
                  clearInterval(timer);
                  setTimeLeft(null);
                  setSessionId(null);
                  sessionStorage.removeItem('diagnosis_doctor_context_' + id);
                } else {
                  setTimeLeft(remaining);
                }
              }, 1000);
            }
          }
        } catch (e) {
          sessionStorage.removeItem('diagnosis_doctor_context_' + id);
        }
      }
    }

    setSessionId(currentSessionId);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [location.state, id]);

  useEffect(() => {
    if (id) {
      fetchDoctorData();
      fetchRecommendations();
    }
  }, [id]);

  useEffect(() => {
    if (accessToken) {
      fetchUserProfile();
    }
  }, [accessToken]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('https://api.mediraai.com/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        setCurrentUser(result.data || result);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const headers: any = { 'Accept': 'application/json' };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const response = await fetch(`https://api.mediraai.com/api/user/doctors/${id}/recommendations`, { headers });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setRecommenders(result.data.recommenders || []);
          setIsRecommendedByMe(result.data.is_recommended_by_me || false);
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleToggleRecommendation = async () => {
    if (!accessToken) return;
    setIsTogglingRecommendation(true);
    try {
      const response = await fetch(`https://api.mediraai.com/api/user/doctors/${id}/recommend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        setIsRecommendedByMe(result.status === 'attached');
        fetchRecommendations();
      }
    } catch (error) {
      console.error('Error toggling recommendation:', error);
    } finally {
      setIsTogglingRecommendation(false);
    }
  };

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.mediraai.com/api/user/doctors/${id}/schedule`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('دکتر مورد نظر یافت نشد');
      }

      const result: ApiResponse = await response.json();

      if (result.success) {
        setDoctorData(result.data.doctor);
        setAvailableSlots(result.data.available_slots);

        const dates = Object.keys(result.data.available_slots);
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedSlot) return;

    if (!accessToken) {
      alert('لطفاً ابتدا وارد حساب کاربری خود شوید');
      return;
    }

    setIsPaying(true);
    setPaymentError(null);

    try {
      const response = await fetch('https://api.mediraai.com/api/user/reservations/reserve-saman', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          slot_id: selectedSlot.id,
          session_id: sessionId,
          gateway: selectedGateway
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'خطا در ثبت نوبت و ارتباط با درگاه پرداخت');
      }

      const paymentUrl = result.data?.payment?.payment_url;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error('آدرس اتصال به درگاه دریافت نشد');
      }

    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'خطا در فرآیند پرداخت');
      setIsPaying(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat('fa-IR', options).format(date);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  async function startChat() {
    try {
      const response = await fetch('https://api.mediraai.com/api/user/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify({ doctor_id: id })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `خطای سرور: ${response.status}`);
      }

      const data = await response.json();
      if (!data.room_id) throw new Error('اطلاعات اتاق چت دریافت نشد');

      navigate(`/consultation/${data.room_id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'خطا در برقراری چت');
    }
  }

  const handleAddReview = () => {
    if (newReview.trim()) {
      setNewReview('');
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
        <div className="h-full bg-gradient-to-b from-blue-50 to-white">
          <PageLoader variant="doctor-profile" showAppBar backTo="/doctors" />
        </div>
    );
  }

  if (error || !doctorData) {
    return (
        <div className="h-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'اطلاعات پزشک یافت نشد'}</p>
            <Button onClick={() => navigate('/doctors')}>بازگشت به لیست پزشکان</Button>
          </div>
        </div>
    );
  }

  const mockEducation = [
    'دکترای پزشکی - دانشگاه علوم پزشکی تهران',
    'تخصص ' + doctorData.specialty_name + ' - بیمارستان امام خمینی'
  ];

  const mockServices = [
    'ویزیت و معاینه تخصصی',
    'تشخیص و درمان بیماری‌ها',
    'مشاوره پزشکی'
  ];

  return (
      <div className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white pb-24" dir="rtl">
        <AppBar backTo="/doctors" />
        <div className="pt-24 px-4 sm:px-6 max-w-3xl mx-auto">

          {/* بنر سشن فعال تشخیص */}
          {timeLeft !== null && timeLeft > 0 && (
              <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl shadow-sm flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">یک سشن تشخیص فعال وجود دارد</p>
                  <p className="text-xs text-blue-600">
                    زمان باقی‌مانده: <span className="font-bold font-mono" dir="ltr">{formatTime(timeLeft)}</span>
                  </p>
                </div>
              </div>
          )}

          {/* کارت مشخصات پزشک */}
          <Card className="p-6 shadow-xl border-0 mb-6">
            <div className="flex gap-4 mb-6 items-start">
              <img
                  src={doctorData.image_url || 'https://via.placeholder.com/150'}
                  alt={doctorData.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-base lg:text-lg font-bold text-gray-900">{doctorData.name}</h1>
                  {doctorData.is_vip && (
                      <Badge className="bg-yellow-500 text-white text-xs">VIP</Badge>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-3">{doctorData.specialty_name}</p>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 ml-1" />
                    <span className="text-sm font-semibold text-gray-900">{doctorData.rating}</span>
                    <span className="text-xs text-gray-500 mr-1">({doctorData.reviews || doctorData.visit_count})</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600">{doctorData.experience}</span>
                </div>
              </div>
              <button
                  onClick={toggleFavorite}
                  className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0 border border-gray-100"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <div className="flex justify-center mb-1"><Award className="w-5 h-5 text-blue-600" /></div>
                <p className="text-xs text-gray-600">تجربه</p>
                <p className="text-sm font-semibold text-gray-900">{doctorData.experience}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="flex justify-center mb-1"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                <p className="text-xs text-gray-600">بیماران</p>
                <p className="text-sm font-semibold text-gray-900">{new Intl.NumberFormat('fa-IR').format(doctorData.visit_count)}+</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <div className="flex justify-center mb-1"><Star className="w-5 h-5 text-purple-600" /></div>
                <p className="text-xs text-gray-600">امتیاز</p>
                <p className="text-sm font-semibold text-gray-900">{doctorData.rating}/۵</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{doctorData.address}</p>
              </div>
              <div className="flex items-center">
                <Wallet className="w-5 h-5 text-gray-400 ml-2" />
                <p className="text-sm text-gray-600">هزینه ویزیت: <span className="text-gray-900 font-bold">{formatPrice(doctorData.visit_price)}</span></p>
              </div>
            </div>
          </Card>

          {/* ========================================================================= */}
          {/* بخش نوبت‌دهی و پرداخت (یکپارچه درون کارت) */}
          {/* ========================================================================= */}
          <Card className="p-5 shadow-xl border-0 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              انتخاب زمان ویزیت و پرداخت
            </h3>

            {Object.keys(availableSlots).length > 0 ? (
                <>
                  {/* انتخاب روز */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 font-medium mb-2">انتخاب تاریخ</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {Object.keys(availableSlots).map((date) => (
                          <button
                              key={date}
                              onClick={() => {
                                setSelectedDate(date);
                                setSelectedSlot(null);
                                setPaymentError(null);
                              }}
                              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                  selectedDate === date
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            {formatDate(date)}
                          </button>
                      ))}
                    </div>
                  </div>

                  {/* انتخاب ساعت */}
                  {selectedDate && availableSlots[selectedDate] && (
                      <div className="mb-4">
                        <label className="block text-sm text-gray-700 font-medium mb-2">ساعت‌های قابل رزرو</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {availableSlots[selectedDate].map((slot: TimeSlot) => {
                            const isSelected = selectedSlot?.id === slot.id;
                            return (
                                <button
                                    key={slot.id}
                                    onClick={() => {
                                      setSelectedSlot(slot);
                                      setPaymentError(null);
                                    }}
                                    className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center border ${
                                        isSelected
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                  <Clock className={`w-4 h-4 ml-2 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                                  {slot.start_time} - {slot.end_time}
                                </button>
                            );
                          })}
                        </div>
                      </div>
                  )}

                  {/* کادر تایید و درگاه پرداخت (درون همین کارت و با انتخاب ساعت نمایان می‌شود) */}
                  {selectedSlot && (
                      <div className="mt-6 pt-5 border-t border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {paymentError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs text-center font-medium">
                              {paymentError}
                            </div>
                        )}

                        {/* خلاصه رزرو */}
                        <div className="flex items-center justify-between bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-800">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>{formatDate(selectedDate)}</span>
                            <span className="text-gray-400">|</span>
                            <span>ساعت {selectedSlot.start_time}</span>
                          </div>
                          <div className="text-sm sm:text-base font-bold text-blue-700">
                            {formatPrice(doctorData.visit_price)}
                          </div>
                        </div>

                        {/* کد تخفیف — فقط ظاهری */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-2 font-medium">
                            کد تخفیف (اختیاری):
                          </label>
                          <div className="flex gap-2">
                            <input
                                type="text"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                                placeholder="کد تخفیف را وارد کنید"
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                                dir="ltr"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                disabled={!discountCode.trim()}
                                className="px-4 text-sm rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 whitespace-nowrap"
                            >
                              اعمال
                            </Button>
                          </div>
                        </div>

                        {/* روش پرداخت */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-2 font-medium">
                            روش پرداخت:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('online')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                                    paymentMethod === 'online'
                                        ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20 shadow-sm'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              <CreditCard className="w-4 h-4 text-blue-600" />
                              پرداخت آنلاین
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                                    paymentMethod === 'cash'
                                        ? 'border-green-600 bg-green-50 text-green-800 ring-2 ring-green-500/20 shadow-sm'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              <Wallet className="w-4 h-4 text-green-600" />
                              پرداخت حضوری
                            </button>
                          </div>

                          {/* توضیح پرداخت حضوری */}
                          {paymentMethod === 'cash' && (
                              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2.5 animate-in fade-in duration-150">
                                <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 leading-relaxed">
                                  با انتخاب پرداخت حضوری، نوبت شما به‌صورت موقت رزرو می‌شود.
                                  برای قطعی شدن، لطفاً <span className="font-bold">سر وقت مراجعه کنید</span> و
                                  مبلغ ویزیت را قبل از ورود به اتاق پزشک پرداخت نمایید.
                                  مراجعه به‌موقع و پرداخت حضوری از لغو شدن نوبت و معطلی سایر بیماران جلوگیری می‌کند.
                                </p>
                              </div>
                          )}
                        </div>

                        {/* انتخاب درگاه — فقط برای پرداخت آنلاین */}
                        {paymentMethod === 'online' && (
                            <div>
                              <label className="block text-xs text-gray-600 mb-2 font-medium">
                                انتخاب درگاه پرداخت:
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedGateway('saman')}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                                        selectedGateway === 'saman'
                                            ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20 shadow-sm'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                  <CreditCard className="w-4 h-4 text-blue-600" />
                                  درگاه سامان (سپ)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedGateway('zarinpal')}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                                        selectedGateway === 'zarinpal'
                                            ? 'border-yellow-500 bg-yellow-50 text-yellow-800 ring-2 ring-yellow-500/20 shadow-sm'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                  <ShieldCheck className="w-4 h-4 text-yellow-600" />
                                  درگاه زرین‌پال
                                </button>
                              </div>
                            </div>
                        )}

                        {/* دکمه نهایی */}
                        <Button
                            onClick={handleProceedToPayment}
                            disabled={isPaying}
                            className={`w-full h-12 font-bold text-sm sm:text-base rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-white ${
                                paymentMethod === 'cash'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                          {isPaying ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                در حال اتصال به درگاه...
                              </>
                          ) : paymentMethod === 'cash' ? (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                ثبت رزرو با پرداخت حضوری
                              </>
                          ) : (
                              <>
                                <ShieldCheck className="w-5 h-5" />
                                پرداخت و قطعی کردن رزرو
                              </>
                          )}
                        </Button>
                      </div>
                  )}

                </>
            ) : (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">در حال حاضر نوبت آزادی برای این پزشک ثبت نشده است</p>
                </div>
            )}
          </Card>

          {/* تب‌های توضیحات و نظرات */}
          <Tabs defaultValue="about" className="mb-6">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="about">درباره پزشک</TabsTrigger>
              <TabsTrigger value="reviews">نظرات</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-4">
              <Card className="p-5 shadow-lg border-0">
                <h3 className="text-base font-bold text-gray-900 mb-3">درباره پزشک</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{doctorData.bio || 'توضیحاتی ثبت نشده است.'}</p>

                <div dir="rtl">
                  <h3 className="text-base font-bold text-gray-900 mb-2">تحصیلات</h3>
                  <ul className="space-y-1 mb-4" dir="rtl">
                    {mockEducation.map((edu: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center" dir="rtl">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-2" />
                          {edu}
                        </li>
                    ))}
                  </ul>
                </div>

                <div dir="rtl">
                  <h3 className="text-base font-bold text-gray-900 mb-2">خدمات تخصصی</h3>
                  <div className="space-y-2" dir="rtl">
                    {mockServices.map((service: string, index: number) => (
                        <div key={index} className="flex items-start" dir="rtl">
                          <Briefcase className="w-4 h-4 text-blue-500 ml-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{service}</span>
                        </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <Card className="p-5 shadow-lg border-0">
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-3">ثبت نظر</h3>
                  <textarea
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      placeholder="تجربه خود را با این پزشک به اشتراک بگذارید..."
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      dir="rtl"
                  />
                  <Button onClick={handleAddReview} className="mt-3" disabled={!newReview.trim()}>
                    ثبت نظر
                  </Button>
                </div>
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">هنوز نظری ثبت نشده است</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* دکمه‌های ارتباطی (چت و تماس تصویری) */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button onClick={() => navigate(`/consultation/${id}`)} variant="outline" className="h-12 border-blue-200 hover:bg-blue-50 text-blue-700">
              <Video className="w-5 h-5 ml-2 text-blue-600" />
              تماس تصویری
            </Button>
            <Button onClick={startChat} variant="outline" className="h-12 border-blue-200 hover:bg-blue-50 text-blue-700">
              <MessageSquare className="w-5 h-5 ml-2 text-blue-600" />
              گفتگوی متنی
            </Button>
          </div>

        </div>
      </div>
  );
}
