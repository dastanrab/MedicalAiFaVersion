import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
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
  FileText
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

const doctorData: any = {
  1: {
    name: 'دکتر سارا جانسون',
    specialty: 'پزشک عمومی',
    location: 'خیابان سجاد، مشهد، ایران',
    distance: '۲.۳ کیلومتر',
    rating: 4.8,
    reviews: 234,
    image: 'https://cdn.tarhpik.com/5_Preview/1404/6/30/053235/a-male-doctor-in-a-white-coat-and-glasses-free-png-400.webp',
    experience: '۱۲ سال',
    patients: '+۲,۵۰۰',
    about: 'دکتر سارا جانسون یک پزشک عمومی دارای بورد تخصصی با بیش از ۱۲ سال تجربه در پزشکی خانواده است. او در زمینه مراقبت‌های پیشگیرانه، مدیریت بیماری‌های مزمن و درمان بیماری‌های حاد تخصص دارد.',
    education: ['دکترای پزشکی - دانشکده پزشکی هاروارد', 'دستیاری - بیمارستان جانز هاپکینز'],
    medicalServices: ['درمان بیماری‌های شایع', 'مراقبت پیشگیرانه و معاینات دوره‌ای', 'تشخیص و ارزیابی پزشکی'],
    consultationFee: '۳۵۰,۰۰۰ تومان',
    availableSlots: ['۹:۰۰', '۱۰:۳۰', '۱۴:۰۰', '۱۶:۰۰'],
    expertTips: [
      {
        id: 1,
        type: 'text',
        title: 'هیدراته بمانید برای سلامت بهتر',
        content: 'نوشیدن آب کافی در طول روز به تنظیم دمای بدن، روان‌کاری مفاصل و انتقال مواد مغذی کمک می‌کند. روزانه ۸ لیوان آب بنوشید.',
        date: '۲ روز پیش',
      },
      {
        id: 2,
        type: 'video',
        title: 'حرکات کششی ۵ دقیقه‌ای صبحگاهی',
        thumbnail: 'https://images.unsplash.com/photo-1758274536083-b821befda77c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3JuaW5nJTIwc3RyZXRjaGVzJTIweG9nYSUyMGV4ZXJjaXNlfGVufDF8fHx8MTc3NTEyNTg4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        videoUrl: 'https://example.com/video',
        duration: '۵:۲۳',
        date: '۱ هفته پیش',
      },
      {
        id: 3,
        type: 'text',
        title: 'آشنایی با آلرژی‌های فصلی',
        content: 'آلرژی‌های بهاره ناشی از گرده درختان و علف‌ها هستند. در روزهای با گرده زیاد پنجره‌ها را ببندید، قبل از خواب دوش بگیرید و از دستگاه تصفیه هوا در خانه استفاده کنید.',
        date: '۲ هفته پیش',
      },
    ],
  },
};

export function DoctorProfile() {
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState('امروز');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const doctor = doctorData[id as string] || doctorData[1];

  const handleBooking = () => {
    setShowBookingDialog(true);
  };

  const confirmBooking = () => {
    setShowBookingDialog(false);
    navigate(`/consultation/${id}`);
  };
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
      if (error.name === 'TypeError') {
        // خطای شبکه (عدم اتصال، CORS و ...)
        console.error('خطای اتصال:', error);
        alert('اتصال به سرور برقرار نشد. لطفاً اینترنت خود را بررسی کنید.');
      } else {
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

  return (
      <div className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white" dir="rtl">
        <div className="pt-24 px-6 pb-24">

          {/* کارت پروفایل پزشک */}
          <Card className="p-6 shadow-xl border-0 mb-6">
            <div className="flex gap-3 mb-6 items-start">
              <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-24 h-24 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <h1 className="text-base lg:text-lg text-gray-900 mb-1">{doctor.name}</h1>
                <p className="text-gray-600 mb-3">{doctor.specialty}</p>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 ml-1" />
                    <span className="text-sm text-gray-900">{doctor.rating}</span>
                    <span className="text-xs text-gray-500 mr-1">({doctor.reviews})</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600">{doctor.experience}</span>
                </div>
              </div>
              <button
                  onClick={toggleFavorite}
                  className=" w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
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
                <p className="text-sm text-gray-900">{doctor.experience}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex justify-center mb-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs text-gray-600">بیماران</p>
                <p className="text-sm text-gray-900">{doctor.patients}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-center mb-1">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs text-gray-600">امتیاز</p>
                <p className="text-sm text-gray-900">{doctor.rating}/۵</p>
              </div>
            </div>

            {/* موقعیت و هزینه */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{doctor.location}</p>
              </div>
              <div className="flex items-center">
                <Wallet className="w-5 h-5 text-gray-400 ml-2" />
                <p className="text-sm text-gray-600">هزینه ویزیت: <span className="text-gray-900">{doctor.consultationFee}</span></p>
              </div>
            </div>
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
                  <p className="text-sm text-gray-600">{doctor.location}</p>
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
                <p className="text-sm text-gray-600 mb-4">{doctor.about}</p>

                <h3 className="text-lg text-gray-900 mb-2">تحصیلات</h3>
                <ul className="space-y-1 mb-4">
                  {doctor.education.map((edu: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-2" />
                        {edu}
                      </li>
                  ))}
                </ul>

                <h3 className="text-lg text-gray-900 mb-2">خدمات پزشکی</h3>
                <div className="space-y-2">
                  {doctor.medicalServices.map((service: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <Briefcase className="w-4 h-4 text-blue-500 ml-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{service}</span>
                      </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg text-gray-900 mb-4">نکات تخصصی سلامت</h3>
                {doctor.expertTips?.map((tip: any) => (
                    <Card key={tip.id} className="p-5 shadow-lg border-0">
                      {tip.type === 'text' ? (
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
                      ) : (
                          <div>
                            <div className="relative mb-3 rounded-lg overflow-hidden">
                              <img
                                  src={tip.thumbnail}
                                  alt={tip.title}
                                  className="w-full h-48 object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                <CirclePlay className="w-16 h-16 text-white fill-white" />
                              </div>
                              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                {tip.duration}
                              </div>
                            </div>
                            <div className="flex items-start">
                              <Video className="w-5 h-5 text-blue-500 ml-2 flex-shrink-0 mt-1" />
                              <div className="flex-1">
                                <h4 className="text-base text-gray-900 mb-1">{tip.title}</h4>
                                <p className="text-xs text-gray-500">{tip.date}</p>
                              </div>
                            </div>
                          </div>
                      )}
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
                <div className="space-y-4">
                  <div className="pb-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500 ml-1" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">۲ روز پیش</span>
                    </div>
                    <p className="text-sm text-gray-900 mb-1">علی رضایی</p>
                    <p className="text-sm text-gray-600">پزشک فوق‌العاده‌ای هستند! بسیار دقیق و مهربان. همه چیز را به خوبی توضیح دادند.</p>
                  </div>

                  <div className="pb-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {[...Array(4)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500 ml-1" />
                        ))}
                        <Star className="w-4 h-4 text-gray-300 ml-1" />
                      </div>
                      <span className="text-xs text-gray-500">۱ هفته پیش</span>
                    </div>
                    <p className="text-sm text-gray-900 mb-1">مریم احمدی</p>
                    <p className="text-sm text-gray-600">تجربه خوبی داشتم. بسیار حرفه‌ای و با دانش هستند.</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500 ml-1" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">۲ هفته پیش</span>
                    </div>
                    <p className="text-sm text-gray-900 mb-1">رضا محمدی</p>
                    <p className="text-sm text-gray-600">کاملاً توصیه می‌کنم! دکتر جانسون بسیار کمک‌کننده و صبور بودند.</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* بخش رزرو نوبت */}
          <Card className="p-5 shadow-xl border-0 mb-6">
            <h3 className="text-lg text-gray-900 mb-4">رزرو نوبت</h3>

            {/* انتخاب تاریخ */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">انتخاب تاریخ</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['امروز', 'فردا', 'سه‌شنبه ۱۱ اردیبهشت', 'چهارشنبه ۱۲ اردیبهشت'].map((date) => (
                    <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                            selectedDate === date
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {date}
                    </button>
                ))}
              </div>
            </div>

            {/* ساعت‌های موجود */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">ساعت‌های موجود</label>
              <div className="grid grid-cols-2 gap-2">
                {doctor.availableSlots.map((slot: string) => (
                    <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-lg text-sm transition-all flex items-center justify-center ${
                            selectedSlot === slot
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      <Clock className="w-4 h-4 ml-2" />
                      {slot}
                    </button>
                ))}
              </div>
            </div>
          </Card>

          {/* دکمه‌های اقدام */}
          <div className="space-y-3">
            <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
              <DialogTrigger asChild>
                <Button
                    onClick={handleBooking}
                    disabled={!selectedSlot}
                    className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white text-lg shadow-lg"
                >
                  <Calendar className="w-5 h-5 ml-2" />
                  رزرو ویزیت حضوری
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader>
                  <DialogTitle>تأیید رزرو نوبت</DialogTitle>
                  <DialogDescription>
                    شما در حال رزرو نوبت با {doctor.name} هستید
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاریخ:</span>
                    <span className="text-gray-900">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ساعت:</span>
                    <span className="text-gray-900">{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">هزینه ویزیت:</span>
                    <span className="text-gray-900">{doctor.consultationFee}</span>
                  </div>
                </div>
                <Button onClick={confirmBooking} className="w-full">
                  تأیید و رزرو
                </Button>
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
