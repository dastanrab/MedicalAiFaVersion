import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, User, Scale, Ruler, Calendar, MapPin, X, Check, Crown } from 'lucide-react';
import svgPaths from '../../imports/MedicalAiMobileAppUi/svg-u90z92ve7h';
import {AppBar} from "../components/AppBar";
import {useAuthStore} from "../store/authStore";

const provinces = [
  'آلبرتا',
  'بریتیش کلمبیا',
  'مانیتوبا',
  'نیوبرانزویک',
  'نیوفاندلند و لابرادور',
  'نوا اسکوشیا',
  'انتاریو',
  'جزیره پرنس ادوارد',
  'کبک',
  'ساسکاچوان',
];

const cities: { [key: string]: string[] } = {
  'انتاریو': ['تورنتو', 'اتاوا', 'می‌سی‌ساگا', 'همیلتون', 'لندن'],
  'کبک': ['مونترال', 'کبک سیتی', 'لاوال', 'گاتینو', 'لونگوی'],
  'بریتیش کلمبیا': ['ونکوور', 'ساری', 'برنابی', 'ریچموند', 'ویکتوریا'],
  'آلبرتا': ['کلگری', 'ادمونتون', 'رد دیر', 'لث‌بریج', 'مدیسین هت'],
};

const pricingPlans = [
  {
    id: 'basic',
    name: 'پایه',
    price: 'رایگان',
    color: 'gray',
    features: [
      'دسترسی به امکانات پایه',
      'تحلیل سلامت محدود',
      'پشتیبانی استاندارد',
    ],
  },
  {
    id: 'pro',
    name: 'پرو',
    price: '۹۹,۰۰۰ تومان/ماه',
    color: 'blue',
    popular: true,
    features: [
      'تمام امکانات پایه',
      'تحلیل پیشرفته سلامت',
      'مشاوره آنلاین',
      'برنامه غذایی شخصی‌سازی شده',
      'پشتیبانی اولویت‌دار',
    ],
  },
  {
    id: 'premium',
    name: 'ویژه',
    price: '۱۹۹,۰۰۰ تومان/ماه',
    color: 'amber',
    features: [
      'تمام امکانات پرو',
      'مشاوره تخصصی نامحدود',
      'برنامه ورزشی اختصاصی',
      'پیگیری ۲۴/۷',
      'گزارش‌های تخصصی ماهانه',
      'دسترسی به متخصصین',
    ],
  },
];

export function UserProfile() {
  const navigate = useNavigate();
  const { accessToken, logout } = useAuthStore();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('basic');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    province: '',
    city: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!accessToken) {
        navigate('/');
        return;
      }

      const response = await fetch('http://185.222.163.113:7000/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت اطلاعات');
      }

      const data = await response.json();

      if (data.success) {
        const user = data.data.user;
        const plan = data.data.plan;

        setFormData({
          firstName: user.name?.split(' ')[0]?.substring(0, 10) || '',
          lastName: user.name?.split(' ')[1]?.substring(0, 10) || '',
          gender: user.gender === 0 ? 'male' : user.gender === 1 ? 'female' : '',
          age: user.age?.toString() || '',
          weight: user.weight?.toString() || '',
          height: user.height?.toString() || '',
          province: user.province || '',
          city: user.city || '',
        });

        setCurrentPlan(plan.type || 'basic');
      }
    } catch (error) {
      console.error('خطا در دریافت پروفایل:', error);
      alert('خطا در دریافت اطلاعات پروفایل');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true); // نمایش حالت در حال بارگذاری هنگام ثبت

      const response = await fetch('http://185.222.163.113:7000/api/user/profile/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          gender: formData.gender === 'male' ? 0 : 1, // هماهنگ با کد لاراول (0 مرد، 1 زن)
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          // شهر و استان حذف شدند
        }),
      });

      const data = await response.json();

      if (data.success) {
        // می‌توانید کاربر را به صفحه اصلی هدایت کنید یا اطلاعات جدید را دوباره fetch کنید
        navigate('/home');
      } else {
        // نمایش خطاهای اعتبارسنجی لاراول در صورت وجود
        const errorMsg = data.errors ? Object.values(data.errors).flat().join('\n') : data.message;
        alert(errorMsg || 'خطا در ذخیره اطلاعات');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (field === 'province') {
      setFormData({ ...formData, province: value, city: '' });
    }
  };

  const availableCities = formData.province ? cities[formData.province] || [] : [];

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">در حال بارگذاری...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen relative bg-gray-50 overflow-y-auto pb-24 font-[YekanBakhFaNum]" dir="rtl">
        <AppBar />

        <div className="px-4 pt-20 py-6 max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="mt-3 font-semibold text-xl text-gray-800">تکمیل پروفایل</h2>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">نام</label>
                <input
                    placeholder="علی"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className="w-full h-11 rounded-lg px-3 bg-white border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">نام خانوادگی</label>
                <input
                    placeholder="احمدی"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className="w-full h-11 rounded-lg px-3 bg-white border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">جنسیت</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => updateField('gender', 'male')}
                    className={`h-11 rounded-lg border-2 transition-all font-medium text-sm ${
                        formData.gender === 'male'
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                >
                  مرد
                </button>
                <button
                    onClick={() => updateField('gender', 'female')}
                    className={`h-11 rounded-lg border-2 transition-all font-medium text-sm ${
                        formData.gender === 'female'
                            ? 'border-pink-500 bg-pink-50 text-pink-600'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                >
                  زن
                </button>
              </div>
            </div>

            {/* Age, Weight, Height */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  سن
                </label>
                <input
                    type="number"
                    placeholder="۲۵"
                    value={formData.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    className="w-full h-11 rounded-lg px-3 bg-white border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" />
                  وزن
                </label>
                <input
                    type="number"
                    placeholder="۷۰"
                    value={formData.weight}
                    onChange={(e) => updateField('weight', e.target.value)}
                    className="w-full h-11 rounded-lg px-3 bg-white border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5" />
                  قد
                </label>
                <input
                    type="number"
                    placeholder="۱۷۵"
                    value={formData.height}
                    onChange={(e) => updateField('height', e.target.value)}
                    className="w-full h-11 rounded-lg px-3 bg-white border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Province & City */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  استان
                </label>
                <select
                    value={formData.province}
                    onChange={(e) => updateField('province', e.target.value)}
                    className="w-full h-11 rounded-lg px-3 bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="">انتخاب کنید</option>
                  {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  شهر
                </label>
                <select
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    disabled={!formData.province}
                    className={`w-full h-11 rounded-lg px-3 bg-white border border-gray-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer ${
                        !formData.province ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  <option value="">{formData.province ? 'انتخاب کنید' : 'ابتدا استان'}</option>
                  {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 space-y-3">
              <button
                  type="button"
                  onClick={() => setShowPricingModal(true)}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-medium text-base transition-colors"
              >
                <Crown className="w-5 h-5" />
                پنل‌های مالی
              </button>
              <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-base transition-colors shadow-lg shadow-blue-200"
              >
                ذخیره پروفایل
              </button>
              <button
                  type="button"
                  onClick={logout}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium text-base transition-colors"
              >
                <LogOut className="w-5 h-5" />
                خروج از حساب
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Modal */}
        {showPricingModal && (
            <div
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4"
                onClick={() => setShowPricingModal(false)}
            >
              <div
                  className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl animate-slide-up"
                  onClick={(e) => e.stopPropagation()}
              >
                {/* Header - ثابت */}
                <div className="sticky top-0 bg-gradient-to-b from-white to-white/95 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-3xl z-10">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">پنل‌های مالی</h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">انتخاب پلن مناسب برای شما</p>
                  </div>
                  <button
                      onClick={() => setShowPricingModal(false)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content - قابل اسکرول */}
                <div className="overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
                  {pricingPlans.map((plan) => (
                      <div
                          key={plan.id}
                          className={`relative rounded-xl sm:rounded-2xl border-2 p-4 sm:p-5 transition-all active:scale-[0.98] sm:hover:scale-[1.02] ${
                              plan.popular
                                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg shadow-blue-200/50'
                                  : plan.id === 'premium'
                                      ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100/50 shadow-lg shadow-amber-200/50'
                                      : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                          }`}
                      >
                        {plan.popular && (
                            <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
                              ⭐ محبوب‌ترین
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <h4 className="text-base sm:text-lg font-bold text-gray-900">{plan.name}</h4>
                          <div className="text-left">
                            <p className={`text-sm sm:text-base font-bold ${
                                plan.id === 'basic' ? 'text-gray-700' :
                                    plan.id === 'pro' ? 'text-blue-600' : 'text-amber-600'
                            }`}>
                              {plan.price}
                            </p>
                            {plan.id !== 'basic' && (
                                <p className="text-[9px] sm:text-[10px] text-gray-500">هر ماه</p>
                            )}
                          </div>
                        </div>

                        <ul className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                          {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                                <Check className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${
                                    plan.id === 'basic' ? 'text-gray-400' :
                                        plan.id === 'pro' ? 'text-blue-500' : 'text-amber-500'
                                }`} />
                                <span>{feature}</span>
                              </li>
                          ))}
                        </ul>

                        <button
                            className={`w-full h-9 sm:h-10 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                                currentPlan === plan.id
                                    ? 'bg-gray-100 text-gray-600 cursor-default'
                                    : plan.id === 'basic'
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        : plan.id === 'pro'
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md hover:shadow-lg'
                                            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-md hover:shadow-lg'
                            }`}
                            disabled={currentPlan === plan.id}
                        >
                          {currentPlan === plan.id ? '✓ پلن فعلی' : plan.id === 'basic' ? 'انتخاب پایه' : '🚀 ارتقا به ' + plan.name}
                        </button>
                      </div>
                  ))}
                </div>

                {/* Footer - ثابت */}
                <div className="sticky bottom-0 bg-gradient-to-t from-white to-white/95 backdrop-blur-sm border-t border-gray-100 px-4 sm:px-6 py-2.5 sm:py-3 rounded-b-3xl sm:rounded-b-3xl">
                  <p className="text-[10px] sm:text-xs text-center text-gray-500">
                    💳 پرداخت امن و رمزنگاری شده
                  </p>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}
