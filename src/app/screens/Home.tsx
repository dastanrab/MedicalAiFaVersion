import { useNavigate } from 'react-router';
import { Activity, Stethoscope, Brain, ChevronRight, UtensilsCrossed, Calendar, Clock, ChevronLeft } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AppBar } from '../components/AppBar';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {useEffect, useState} from "react";
import {useAuthStore} from "../store/authStore";

const blogPosts = [
  {
    id: 1,
    title: '۱۰ نکته برای سلامت بهتر قلب',
    excerpt: 'با این تغییرات ساده قلبی سالم‌تر داشته باشید.',
    image: 'https://clinicniavaran.com/wp-content/uploads/2022/07/scanning11.jpg?...',
    date: '۲۸ اسفند ۱۴۰۴',
    readTime: '۵ دقیقه مطالعه',
  },
  {
    id: 2,
    title: 'راهنمای تغذیه متعادل',
    excerpt: 'با مواد مغذی ضروری عملکرد سالم بدن خود آشنا شوید.',
    image: 'scan.jpg',
    date: '۲۵ اسفند ۱۴۰۴',
    readTime: '۷ دقیقه مطالعه',
  },
  {
    id: 3,
    title: 'مزایای ورزش منظم',
    excerpt: 'فعال ماندن چرا برای سلامت جسم و روان ضروری است.',
    image: 'scan.jpg',
    date: '۲۰ اسفند ۱۴۰۴',
    readTime: '۶ دقیقه مطالعه',
  },
  {
    id: 4,
    title: 'سلامت روان: شکستن تابوها',
    excerpt: 'اهمیت سلامت روان در تندرستی کلی بدن را بشناسید.',
    image: 'scan.jpg',
    date: '۱۵ اسفند ۱۴۰۴',
    readTime: '۸ دقیقه مطالعه',
  },
];

function NextArrow(props: any) {
  const { onClick } = props;
  return (
      <button
          onClick={onClick}
          className="absolute top-1/2 -translate-y-1/2 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>
  );
}

function PrevArrow(props: any) {
  const { onClick } = props;
  return (
      <button
          onClick={onClick}
          className="absolute top-1/2 -translate-y-1/2 left-2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://185.222.163.113:7000/api/user/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success) {
          setUserData(data.data.user);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (accessToken) fetchProfile();
  }, [accessToken]);
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1.2,
    slidesToScroll: 1,
    autoplay: true,
    rtl: true,
    autoplaySpeed: 3000,
    arrows: true,
    centerMode: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
      <div className=" font-[YekanBakhFaNum] h-full bg-gradient-to-b from-blue-50 to-white overflow-y-auto overflow-x-hidden pb-24">
        <AppBar />

        <div className="px-6 pt-24 py-8 text-right">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl text-gray-900">
              سلام {userData?.name?.split(' ')[0] || 'کاربر'} عزیز 👋
            </h1>
            <p className="text-gray-600 mt-1">امروز حالتان چطور است؟</p>
          </div>

          {/* Quick Stats Card */}
          <Card className="p-6 mb-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}></div>
            <div className="relative z-10">
              <h3 className="text-lg mb-4 opacity-90">نمای کلی سلامت</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl">۱۲</p>
                  <p className="text-sm opacity-80">معاینه</p>
                </div>
                <div>
                  <p className="text-2xl">۸</p>
                  <p className="text-sm opacity-80">نسخه</p>
                </div>
                <div>
                  <p className="text-2xl">۴٫۸</p>
                  <p className="text-sm opacity-80">امتیاز</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Main Actions */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl text-gray-900">دسترسی سریع</h2>
            {/* نمایش شرطی تقویم پریود فقط برای خانم‌ها (جنسیت 1) */}
            {userData?.gender === 1 && (
                <Card
                    onClick={() => navigate('/period-tracker')}
                    className="p-5 shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer active:scale-98 animate-in fade-in duration-500"
                >
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl flex items-center justify-center ml-4 mr-4">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg text-gray-900">تقویم قاعدگی</h3>
                      <p className="text-sm text-gray-600">ثبت و پیش‌بینی چرخه قاعدگی</p>
                    </div>
                    <ChevronLeft className="w-6 h-6 text-gray-400" />
                  </div>
                </Card>
            )}
            <Card
                onClick={() => navigate('/symptoms')}
                className="p-5 shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer active:scale-98"
            >
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center ml-4 mr-4">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900">بررسی علائم</h3>
                  <p className="text-sm text-gray-600">تشخیص با هوش مصنوعی</p>
                </div>
                <ChevronLeft className="w-6 h-6 text-gray-400" />
              </div>
            </Card>

            <Card
                onClick={() => navigate('/doctors')}
                className="p-5 shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer active:scale-98"
            >
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center ml-4 mr-4">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900">پزشکان</h3>
                  <p className="text-sm text-gray-600">رزرو وقت ملاقات</p>
                </div>
                <ChevronLeft className="w-6 h-6 text-gray-400" />
              </div>
            </Card>

            <Card className="p-5 shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer active:scale-98">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center ml-4 mr-4">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900">بینش‌های سلامتی هوشمند</h3>
                  <p className="text-sm text-gray-600">نکات شخصی‌سازی‌شده</p>
                </div>
                <ChevronLeft className="w-6 h-6 text-gray-400" />
              </div>
            </Card>

            <Card
                onClick={() => navigate('/body-measurement')}
                className="p-5 shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer active:scale-98"
            >
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center ml-4 mr-4">
                  <UtensilsCrossed className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900">تناسب و تغذیه</h3>
                  <p className="text-sm text-gray-600">تغذیه اختصاصی بدن شما</p>
                </div>
                <ChevronLeft className="w-6 h-6 text-gray-400" />
              </div>
            </Card>

          </div>

          {/* Recent Activity */}
          <div className="mb-8">
            <h2 className="text-xl text-gray-900 mb-4">فعالیت‌های اخیر</h2>
            <Card className="p-4 shadow-lg border-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-gray-900">دکتر سارا جانسون</p>
                    <p className="text-sm text-gray-600">مشاوره - تکمیل شده</p>
                  </div>
                  <p className="text-xs text-gray-500">۲ روز پیش</p>
                </div>
                <div className="border-t pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">بررسی علائم</p>
                    <p className="text-sm text-gray-600">تحلیل سردرد خفیف</p>
                  </div>
                  <p className="text-xs text-gray-500">۵ روز پیش</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Blog Posts Slider */}
        <div className="mb-8 overflow-hidden">
          <h2 className="text-xl text-gray-900 mb-4 px-6">آخرین مقالات سلامت</h2>
          <div className="blog-slider-container  px-4">
            <Slider {...sliderSettings}>
              {blogPosts.map(post => (
                  <div key={post.id} className="px-2">
                    <Card className="p-4 shadow-lg border-0">
                      <div className="space-y-3">
                        <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded-lg" />
                        <h3 className="text-lg text-gray-900">{post.title}</h3>
                        <p className="text-sm text-gray-600">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-gray-500 text-xs">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <p>{post.date}</p>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <p>{post.readTime}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
  );
}
