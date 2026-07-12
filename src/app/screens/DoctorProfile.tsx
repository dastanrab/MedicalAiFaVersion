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
  CirclePlay,
  FileText,
  Loader2
} from 'lucide-react';
import mapImage from 'figma:asset/64bcbcf457707b2cfce084e06eccf4fbded0e165.png';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {useAuthStore} from "../store/authStore";
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
  const sessionId = location.state?.sessionId || null;
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Record<string, TimeSlot[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [reservationToken, setReservationToken] = useState<string | null>(null);
  const [reservationExpiry, setReservationExpiry] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    fetchDoctorData();
  }, [id]);

  // اضافه کردن useEffect برای بررسی رزرو فعال هنگام بارگذاری صفحه
  useEffect(() => {
    if (doctorData?.id && accessToken) {
      checkActiveReservation();
    }
  }, [doctorData?.id, accessToken]);

// تابع بررسی رزرو فعال
  const checkActiveReservation = async () => {
    try {
      const response = await fetch(
          `http://185.222.163.113:7000/api/user/reservations/active?doctor_id=${doctorData.id}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
      );

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.data) {
          // تنظیم state ها با اطلاعات رزرو فعال
          setReservationToken(result.data.reservation_token);
          setReservationExpiry(result.data.expires_at);

          // پیدا کردن اسلات مربوطه
          const slot = availableSlots.find(s => s.id === result.data.slot_id);
          if (slot) {
            setSelectedSlot(slot);
            setSelectedDate(result.data.slot_date);
          }

          // نمایش مدال تایید نهایی
          setShowConfirmDialog(true);

          // نمایش پیام اطلاع‌رسانی
          alert(`شما یک رزرو فعال دارید که ${Math.floor(result.data.remaining_seconds / 60)} دقیقه دیگر منقضی می‌شود`);
        }
      }
    } catch (error) {
      // در صورت عدم وجود رزرو فعال، خطایی نمایش نمی‌دهیم
      console.log('No active reservation found');
    }
  };

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://185.222.163.113:7000/api/user/doctors/${id}/schedule`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت اطلاعات پزشک');
      }

      const result: ApiResponse = await response.json();

      if (result.success) {
        setDoctorData(result.data.doctor);
        setAvailableSlots(result.data.available_slots);

        // انتخاب اولین تاریخ موجود به عنوان پیش‌فرض
        const dates = Object.keys(result.data.available_slots);
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
      console.error('Error fetching doctor data:', err);
    } finally {
      setLoading(false);
    }
  };
  const cancelReservation = async () => {
    if (!reservationToken) return;

    if (!confirm('آیا از لغو رزرو موقت اطمینان دارید؟')) {
      return;
    }

    setIsCancelling(true);
    setConfirmError(null);

    try {
      const response = await fetch('http://185.222.163.113:7000/api/user/reservations/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          reservation_token: reservationToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در لغو رزرو');
      }

      const result = await response.json();

      if (result.success) {
        // پاک کردن state های رزرو
        setReservationToken(null);
        setReservationExpiry(null);
        setSelectedSlot(null);
        setShowConfirmDialog(false);

        // بروزرسانی لیست نوبت‌ها
        await fetchDoctorData();

        alert('رزرو موقت شما لغو شد');
      }
    } catch (error) {
      setConfirmError(error instanceof Error ? error.message : 'خطا در لغو رزرو');
    } finally {
      setIsCancelling(false);
    }
  };


  const handleReserveSlot = async () => {
    if (!selectedSlot) return;

    if (reservationToken) {
      setReserveError('شما قبلاً یک رزرو فعال دارید');
      setShowBookingDialog(false);
      setShowConfirmDialog(true);
      return;
    }

    setIsReserving(true);
    setReserveError(null); // پاک کردن خطای قبلی

    try {
      const response = await fetch('http://185.222.163.113:7000/api/user/reservations/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          slot_id: selectedSlot.id,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در رزرو موقت');
      }

      const result = await response.json();

      if (result.success) {
        setReservationToken(result.data.reservation_token);
        setReservationExpiry(result.data.expires_at);
        setShowBookingDialog(false);
        setShowConfirmDialog(true);
      }
    } catch (error) {
      setReserveError(error instanceof Error ? error.message : 'خطا در رزرو موقت');
    } finally {
      setIsReserving(false);
    }
  };



  const confirmBooking = async () => {
    if (!reservationToken) return;

    setIsConfirming(true);
    setConfirmError(null);

    try {
      // ─────────────────────────────────────────────
      // شبیه‌سازی authority و status از درگاه
      // ─────────────────────────────────────────────
      const mockAuthority = `A${String(Date.now()).slice(-35)}`;
      const mockStatus = 'OK'; // برای تست، همیشه موفق فرض می‌شود

      // در پروداکشن واقعی، این مقادیر از query parameters callback URL می‌آیند

      const response = await fetch('http://185.222.163.113:7000/api/user/reservations/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          reservation_token: reservationToken,
          authority: mockAuthority,  // ← اضافه شد
          status: mockStatus          // ← اضافه شد
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در تایید رزرو');
      }

      const result = await response.json();

      if (result.success) {
        setReservationToken(null);
        setReservationExpiry(null);
        setSelectedSlot(null);
        setShowConfirmDialog(false);

        await fetchDoctorData();

        // نمایش پیام موفقیت با RefID
        alert(`رزرو با موفقیت تکمیل شد\nشماره پیگیری: ${result.data.payment.ref_id}`);
      }
    } catch (error) {
      setConfirmError(error instanceof Error ? error.message : 'خطا در تایید رزرو');
    } finally {
      setIsConfirming(false);
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

  const handleBooking = () => {
    if (selectedSlot) {
      setShowBookingDialog(true);
    }
  };

  // const confirmBooking = () => {
  //   setShowBookingDialog(false);
  //   navigate(`/consultation/${id}`);
  // };

  async function startChat() {
    try {
      const response = await fetch('http://185.222.163.113:7000/api/user/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify({ doctor_id: id })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.message || `خطای سرور: ${response.status}`;
        throw new Error(message);
      }

      const data = await response.json();

      if (!data.room_id) {
        throw new Error('اطلاعات اتاق چت دریافت نشد');
      }

      navigate(`/consultation/${data.room_id}`);

    } catch (error) {
      if (error instanceof TypeError) {
        console.error('خطای اتصال:', error);
        alert('اتصال به سرور برقرار نشد. لطفاً اینترنت خود را بررسی کنید.');
      } else if (error instanceof Error) {
        console.error('خطا:', error.message);
        alert(error.message);
      }
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
        <div className="h-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
          <PageLoader />
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

  const mockTips = [
    {
      id: 1,
      type: 'text',
      title: 'نکات مهم سلامت',
      content: 'مراقبت از سلامتی خود را جدی بگیرید و به طور منظم معاینات دوره‌ای انجام دهید.',
      date: '۲ روز پیش',
    }
  ];

  return (
      <div className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white" dir="rtl">
        <AppBar backTo="/doctors" />
        <div className="pt-24 px-6 pb-24">

          {/* کارت پروفایل پزشک */}
          <Card className="p-6 shadow-xl border-0 mb-6">
            <div className="flex gap-3 mb-6 items-start">
              <img
                  src={doctorData.image_url || 'https://via.placeholder.com/150'}
                  alt={doctorData.name}
                  className="w-24 h-24 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-base lg:text-lg text-gray-900">{doctorData.name}</h1>
                  {doctorData.is_vip && (
                      <Badge className="bg-yellow-500 text-white text-xs">VIP</Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{doctorData.specialty_name}</p>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 ml-1" />
                    <span className="text-sm text-gray-900">{doctorData.rating}</span>
                    <span className="text-xs text-gray-500 mr-1">({doctorData.reviews || doctorData.visit_count})</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600">{doctorData.experience}</span>
                </div>
              </div>
              <button
                  onClick={toggleFavorite}
                  className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
              >
                <Heart
                    className={`w-6 h-6 ${
                        isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                    }`}
                />
              </button>
            </div>

            {/* آمار سریع */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-center mb-1">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600">تجربه</p>
                <p className="text-sm text-gray-900">{doctorData.experience}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex justify-center mb-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs text-gray-600">بیماران</p>
                <p className="text-sm text-gray-900">{new Intl.NumberFormat('fa-IR').format(doctorData.visit_count)}+</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-center mb-1">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs text-gray-600">امتیاز</p>
                <p className="text-sm text-gray-900">{doctorData.rating}/۵</p>
              </div>
            </div>

            {/* موقعیت و هزینه */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{doctorData.address}</p>
              </div>
              <div className="flex items-center">
                <Wallet className="w-5 h-5 text-gray-400 ml-2" />
                <p className="text-sm text-gray-600">هزینه ویزیت: <span className="text-gray-900">{formatPrice(doctorData.visit_price)}</span></p>
              </div>
            </div>

            {/* تگ‌ها */}
            {doctorData.tags && doctorData.tags.length > 0 && (
                <div className="pt-4 border-t mt-4">
                  <div className="flex flex-wrap gap-2">
                    {doctorData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                    ))}
                  </div>
                </div>
            )}
          </Card>

          {/* بخش نقشه */}
          <Card className="overflow-hidden shadow-lg border-0 mb-6">
            <img
                src={mapImage}
                alt="نقشه موقعیت"
                className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-500 ml-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900 mb-0.5">موقعیت مطب</p>
                  <p className="text-sm text-gray-600">{doctorData.address}</p>
                  {(doctorData.city || doctorData.province) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {doctorData.city && doctorData.city}
                        {doctorData.city && doctorData.province && '، '}
                        {doctorData.province && doctorData.province}
                      </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* تب‌ها */}
          <Tabs defaultValue="about" className="mb-6">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="about">درباره</TabsTrigger>
              <TabsTrigger value="tips">نکات</TabsTrigger>
              <TabsTrigger value="reviews">نظرات</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-4">
              <Card className="p-5 shadow-lg border-0">
                <h3 className="text-lg text-gray-900 mb-3">درباره پزشک</h3>
                <p className="text-sm text-gray-600 mb-4">{doctorData.bio}</p>

                <h3 className="text-lg text-gray-900 mb-2">تحصیلات</h3>
                <ul className="space-y-1 mb-4">
                  {mockEducation.map((edu: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-2" />
                        {edu}
                      </li>
                  ))}
                </ul>

                <h3 className="text-lg text-gray-900 mb-2">خدمات پزشکی</h3>
                <div className="space-y-2">
                  {mockServices.map((service: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <Briefcase className="w-4 h-4 text-blue-500 ml-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{service}</span>
                      </div>
                  ))}
                </div>

                {doctorData.medical_code && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        کد نظام پزشکی: <span className="text-gray-900">{doctorData.medical_code}</span>
                      </p>
                    </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg text-gray-900 mb-4">نکات تخصصی سلامت</h3>
                {mockTips.map((tip: any) => (
                    <Card key={tip.id} className="p-5 shadow-lg border-0">
                      <div>
                        <div className="flex items-start mb-3">
                          <FileText className="w-5 h-5 text-blue-500 ml-2 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h4 className="text-base text-gray-900 mb-1">{tip.title}</h4>
                            <p className="text-xs text-gray-500">{tip.date}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{tip.content}</p>
                      </div>
                    </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <Card className="p-5 shadow-lg border-0">
                {/* بخش ثبت نظر */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="text-lg text-gray-900 mb-3">ثبت نظر</h3>
                  <textarea
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      placeholder="تجربه خود را با این پزشک به اشتراک بگذارید..."
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      dir="rtl"
                  />
                  <Button
                      onClick={handleAddReview}
                      className="mt-3 w-full sm:w-auto"
                      disabled={!newReview.trim()}
                  >
                    ثبت نظر
                  </Button>
                </div>

                {/* نظرات موجود */}
                <h3 className="text-lg text-gray-900 mb-4">نظرات کاربران</h3>
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">هنوز نظری ثبت نشده است</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* بخش رزرو نوبت */}
          <Card className="p-5 shadow-xl border-0 mb-6">
            <h3 className="text-lg text-gray-900 mb-4">رزرو نوبت</h3>

            {reservationToken && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-800">
                      <CheckCircle className="w-5 h-5 ml-2" />
                      <span>شما یک رزرو فعال دارید</span>
                    </div>
                    <Button
                        onClick={() => setShowConfirmDialog(true)}
                        variant="outline"
                        size="sm"
                        className="text-green-700 border-green-300 hover:bg-green-100"
                    >
                      مشاهده و تایید
                    </Button>
                  </div>
                </div>
            )}
            {Object.keys(availableSlots).length > 0 ? (
                <>
                  {/* انتخاب تاریخ */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-2">انتخاب تاریخ</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {Object.keys(availableSlots).map((date) => (
                          <button
                              key={date}
                              onClick={() => {
                                setSelectedDate(date);
                                setSelectedSlot(null);
                              }}
                              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                                  selectedDate === date
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            {formatDate(date)}
                          </button>
                      ))}
                    </div>
                  </div>

                  {/* ساعت‌های موجود */}
                  {selectedDate && availableSlots[selectedDate] && (
                      <div className="mb-4">
                        <label className="block text-sm text-gray-700 mb-2">ساعت‌های موجود</label>
                        <div className="grid grid-cols-2 gap-2">
                          {availableSlots[selectedDate].map((slot: TimeSlot) => (
                              <button
                                  key={slot.id}
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`p-3 rounded-lg text-sm transition-all flex items-center justify-center ${
                                      selectedSlot?.id === slot.id
                                          ? 'bg-green-500 text-white'
                                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                              >
                                <Clock className="w-4 h-4 ml-2" />
                                {slot.start_time} - {slot.end_time}
                              </button>
                          ))}
                        </div>
                      </div>
                  )}
                </>
            ) : (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">در حال حاضر نوبت آزادی وجود ندارد</p>
                </div>
            )}
          </Card>

          {/* دکمه‌های اقدام */}
          <div className="space-y-3">
            <Dialog open={showBookingDialog}  onOpenChange={(open) => {
              setShowBookingDialog(open);
              if (!open) setReserveError(null);
            }}>
              <DialogTrigger asChild>
                <Button
                    onClick={() => {
                      if (selectedSlot) {
                        setShowBookingDialog(true);
                      }
                    }}
                    disabled={!selectedSlot}
                    className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calendar className="w-5 h-5 ml-2" />
                  رزرو ویزیت حضوری
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader>
                  <DialogTitle>تأیید رزرو موقت</DialogTitle>
                  <DialogDescription>
                    این نوبت برای ۱۵ دقیقه برای شما رزرو خواهد شد
                  </DialogDescription>
                </DialogHeader>
                {selectedSlot && (
                    <div className="space-y-3 py-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاریخ:</span>
                        <span className="text-gray-900">{formatDate(selectedDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ساعت:</span>
                        <span className="text-gray-900">{selectedSlot.start_time} - {selectedSlot.end_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">هزینه ویزیت:</span>
                        <span className="text-gray-900">{formatPrice(doctorData.visit_price)}</span>
                      </div>
                    </div>
                )}
                {reserveError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <p className="text-red-800 text-sm">{reserveError}</p>
                    </div>
                )}

                <Button
                    onClick={handleReserveSlot}
                    className="w-full"
                    disabled={isReserving}
                >
                  {isReserving ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        در حال رزرو...
                      </>
                  ) : (
                      'رزرو موقت (۱۵ دقیقه)'
                  )}
                </Button>
              </DialogContent>

            </Dialog>

            <Dialog open={showConfirmDialog} onOpenChange={(open) => {
              setShowConfirmDialog(open);
              if (!open) setConfirmError(null);
            }}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>تایید نهایی رزرو</DialogTitle>
                  <DialogDescription>
                    رزرو موقت شما برای ۱۵ دقیقه ثبت شده است
                  </DialogDescription>
                </DialogHeader>

                {selectedSlot && (
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
              زمان باقی‌مانده: {reservationExpiry ?
                              Math.max(0, Math.floor((new Date(reservationExpiry).getTime() - Date.now()) / 1000 / 60))
                              : 0} دقیقه
            </span>
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                          <p><strong>تاریخ:</strong> {selectedDate}</p>
                          <p><strong>ساعت:</strong> {selectedSlot.start_time} - {selectedSlot.end_time}</p>
                        </div>
                      </div>

                      {confirmError && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-800 text-sm">{confirmError}</p>
                          </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                            onClick={confirmBooking}
                            disabled={isConfirming || isCancelling}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {isConfirming ? 'در حال تایید...' : 'تأیید نهایی'}
                        </Button>

                        <Button
                            onClick={cancelReservation}
                            disabled={isConfirming || isCancelling}
                            variant="destructive"
                            className="flex-1"
                        >
                          {isCancelling ? 'در حال لغو...' : 'لغو رزرو'}
                        </Button>
                      </div>
                    </div>
                )}
              </DialogContent>
            </Dialog>


            <div className="grid grid-cols-2 gap-3">
              <Button
                  onClick={() => navigate(`/consultation/${id}`)}
                  variant="outline"
                  className="h-12"
              >
                <Video className="w-5 h-5 ml-2" />
                تماس تصویری
              </Button>
              <Button
                  onClick={startChat}
                  variant="outline"
                  className="h-12"
              >
                <MessageSquare className="w-5 h-5 ml-2" />
                گفتگو
              </Button>
            </div>
          </div>

        </div>
      </div>
  );
}
