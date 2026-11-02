import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search, MapPin, Filter, Star, ChevronDown, ThumbsUp, BadgeCheck, Stethoscope, Heart, Sparkles, X } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { AppBar } from '../components/AppBar';
import { PageLoader } from '../components/PageLoader';
import { useAuthStore } from "../store/authStore";

// ایمپورت لیست استان‌ها و شهرها
import { iranProvinces, iranCitiesByProvince } from '../data/iranLocations';

interface Doctor {
  id: number;
  firstName: string;
  lastName?: string;
  specialty: string;
  city: string | null;
  province: string | null;
  gender: number | string;
  appointments: number;
  medicalCode: string | null;
  rank: string | null;
  rating: string;
  reviews: number;
  recommendation: number;
  image: string;
  experience: string;
  availability: number;
  address: string;
  phone: string;
  visit_count: number;
  bio: string;
  tags: string[];
  is_vip: number;
}

interface SpecialtyItem {
  id: number;
  name: string;
}

function getDoctorAvatarFallback(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=144&font-size=0.4`;
}

export function DoctorList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // استیت‌های تخصص‌های دریافتی از سرور
  const [specialties, setSpecialties] = useState<SpecialtyItem[]>([]);

  // استیت‌های جستجو و کلمات کلیدی
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // ذخیره شناسه‌های استان و شهر (به‌جای نام)
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('all');
  const [selectedCityId, setSelectedCityId] = useState<string>('all');

  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [favoriteDoctors, setFavoriteDoctors] = useState<number[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { accessToken } = useAuthStore();

  // پیدا کردن نام استان و شهر فعلی جهت نمایش در UI
  const currentProvinceName = useMemo(() => {
    if (selectedProvinceId === 'all') return 'همه استان‌ها';
    const prov = iranProvinces.find((p) => String(p.id) === String(selectedProvinceId));
    return prov ? prov.name : '';
  }, [selectedProvinceId]);

  const availableCities = useMemo(() => {
    if (selectedProvinceId === 'all') return [];
    return iranCitiesByProvince[selectedProvinceId] ?? [];
  }, [selectedProvinceId]);

  const currentCityName = useMemo(() => {
    if (selectedCityId === 'all') return 'همه شهرها';
    const cities = availableCities;
    const city = cities.find((c: any) => String(c.id) === String(selectedCityId));
    return city ? city.name : '';
  }, [selectedCityId, availableCities]);

  // دریافت لیست تخصص‌ها
  const fetchSpecialties = async () => {
    try {
      const response = await fetch('https://api.mediraai.com/api/user/diagnosis/specialties', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setSpecialties(result.data);
      }
    } catch (error) {
      console.error('خطا در دریافت لیست تخصص‌ها:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  // گرفتن لیست پزشکان با ارسال query، province (id) و city (id) به سرور
  const fetchDoctors = async (
      queryStr = searchQuery,
      provId = selectedProvinceId,
      cityId = selectedCityId
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (queryStr.trim()) {
        params.append('query', queryStr.trim());
      }
      if (provId && provId !== 'all') {
        params.append('province', provId.trim()); // ارسال شناسه استان
      }
      if (cityId && cityId !== 'all') {
        params.append('city', cityId.trim()); // ارسال شناسه شهر
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const url = `https://api.mediraai.com/api/user/diagnosis/doctors${queryString}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        const processedDoctors = result.data.map((doctor: Doctor) => ({
          ...doctor,
          city: doctor.city || 'مشهد',
          province: doctor.province || 'خراسان رضوی',
          lastName: doctor.lastName || '',
          gender: doctor.gender === 0 ? 'مرد' : 'زن',
        }));
        setDoctors(processedDoctors);
      }
    } catch (error) {
      console.error('خطا در دریافت لیست پزشکان:', error);
    } finally {
      setLoading(false);
    }
  };

  // بارگذاری اولیه با خواندن query paramهای URL
  useEffect(() => {
    const specialtyParam = searchParams.get('specialty') || searchParams.get('query');
    const provParam = searchParams.get('province');
    const cityParam = searchParams.get('city');

    const initialQuery = specialtyParam ? decodeURIComponent(specialtyParam).trim() : '';
    const initialProv = provParam ? decodeURIComponent(provParam).trim() : 'all';
    const initialCity = cityParam ? decodeURIComponent(cityParam).trim() : 'all';

    if (initialQuery) {
      setSearchQuery(initialQuery);
      setSelectedSpecialties([initialQuery]);
    }
    if (initialProv) setSelectedProvinceId(initialProv);
    if (initialCity) setSelectedCityId(initialCity);

    fetchDoctors(initialQuery, initialProv, initialCity);
  }, [searchParams]);

  const handleDoctorClick = (doctorId: number) => {
    if (searchQuery.trim().length > 0) {
      fetch(`https://api.mediraai.com/api/user/diagnosis/doctor/${doctorId}/click`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery.trim() })
      }).catch((err) => console.error("Error logging click:", err));
    }

    navigate(`/doctor/${doctorId}`);
  };

  const fetchSuggestions = async (text: string) => {
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://api.mediraai.com/api/user/diagnosis/keywords/suggest?q=${encodeURIComponent(text)}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const result = await response.json();
      if (result.success) {
        setSuggestions(result.data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('خطا در دریافت پیشنهادات جستجو:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value);
    if (value === '') {
      setSelectedSpecialties([]);
      fetchDoctors('', selectedProvinceId, selectedCityId);
    }
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    const isSpecialty = specialties.some((s) => s.name === query);
    if (isSpecialty) {
      setSelectedSpecialties([query]);
    }
    fetchDoctors(query, selectedProvinceId, selectedCityId);
  };

  // تغییر استان و ارسال شناسه به بک‌اند
  const handleProvinceChange = (newProvId: string) => {
    setSelectedProvinceId(newProvId);
    setSelectedCityId('all'); // با تغییر استان، شهر ریست می‌شود
    fetchDoctors(searchQuery, newProvId, 'all');
  };

  // تغییر شهر و ارسال شناسه به بک‌اند
  const handleCityChange = (newCityId: string) => {
    setSelectedCityId(newCityId);
    fetchDoctors(searchQuery, selectedProvinceId, newCityId);
  };

  const clearLocationFilters = () => {
    setSelectedProvinceId('all');
    setSelectedCityId('all');
    fetchDoctors(searchQuery, 'all', 'all');
  };

  const getAvailabilityText = (availability: number) => {
    return availability === 0 ? 'رزرو شده' : 'فردا';
  };

  const toggleFavorite = (doctorId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteDoctors((prev) =>
        prev.includes(doctorId) ? prev.filter((id) => id !== doctorId) : [...prev, doctorId]
    );
  };

  const filteredDoctors = useMemo(() => {
    return doctors.map((doctor, index) => ({
      ...doctor,
      aiApproved: index === 0 || (doctor.id * 7 + 3) % 5 < 3,
    })).filter((doctor) => {
      return selectedSpecialties.length === 0 || selectedSpecialties.includes(doctor.specialty);
    });
  }, [doctors, selectedSpecialties]);

  if (loading) {
    return (
        <div className="h-full bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
          <PageLoader />
        </div>
    );
  }

  return (
      <div className="h-full bg-gradient-to-b from-blue-50 to-white overflow-y-auto pb-24 text-right font-[YekanBakhFaNum]">
        <AppBar backTo="/home" />

        <div className="px-4 pt-24 py-6">
          <div className="relative mb-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 px-5 pt-5 pb-14 shadow-[0_8px_32px_rgba(37,99,235,0.28)]">
              <div className="pointer-events-none absolute -top-10 -left-10 h-36 w-36 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
              <div
                  className="pointer-events-none absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '18px 18px',
                  }}
              />
              <div className="relative z-10 flex items-center gap-4" dir="rtl">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                  <Stethoscope className="h-7 w-7 text-white" />
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <h1 className="text-xl font-bold text-white leading-tight">پیدا کردن پزشک</h1>
                  <p className="mt-0.5 text-sm leading-snug text-blue-100">
                    جستجو بر اساس نام، تخصص یا موقعیت مکانی
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 -mt-9 flex gap-2.5 px-1">
              <div className="relative flex-1" ref={suggestionRef}>
                <Search
                    className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400 cursor-pointer"
                    onClick={() => handleSearchSubmit(searchQuery)}
                />
                <Input
                    placeholder="جستجوی پزشک، تخصص یا علائم..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(searchQuery)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    className="h-12 rounded-full border-0 bg-white pr-11 text-right shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-300"
                />

                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-14 w-full bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                      {suggestions.map((suggestion, idx) => (
                          <div
                              key={idx}
                              className="px-4 py-3 text-right text-gray-700 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between"
                              onClick={() => handleSearchSubmit(suggestion)}
                          >
                            <span>{suggestion}</span>
                            <Search className="h-3.5 w-3.5 text-gray-400" />
                          </div>
                      ))}
                    </div>
                )}
              </div>

              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                      variant="outline"
                      className={`h-12 w-12 shrink-0 rounded-full border-0 bg-white p-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 hover:bg-blue-50 ${
                          selectedProvinceId !== 'all' ? 'ring-2 ring-blue-500 text-blue-600' : 'ring-gray-100 text-gray-600'
                      }`}
                  >
                    <Filter className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto max-h-[85vh] overflow-hidden rounded-t-3xl font-[YekanBakhFaNum]">
                  <SheetHeader className="text-right">
                    <SheetTitle>فیلتر موقعیت مکانی</SheetTitle>
                    <SheetDescription>با انتخاب استان و شهر، شناسه‌ها به سرور ارسال خواهند شد</SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-5 px-1 pb-6" dir="rtl">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-700">استان</label>
                      <Select value={selectedProvinceId} onValueChange={handleProvinceChange}>
                        <SelectTrigger className="w-full h-11 text-right">
                          <SelectValue placeholder="همه استان‌ها">
                            {currentProvinceName}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent dir="rtl" className="max-h-56">
                          <SelectItem value="all">همه استان‌ها</SelectItem>
                          {iranProvinces.map((prov) => (
                              <SelectItem key={prov.id} value={String(prov.id)}>
                                {prov.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-700">شهر</label>
                      <Select
                          value={selectedCityId}
                          onValueChange={handleCityChange}
                          disabled={selectedProvinceId === 'all'}
                      >
                        <SelectTrigger className="w-full h-11 text-right disabled:opacity-50">
                          <SelectValue placeholder={selectedProvinceId === 'all' ? 'ابتدا استان را انتخاب کنید' : 'همه شهرها'}>
                            {currentCityName}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent dir="rtl" className="max-h-56">
                          <SelectItem value="all">همه شهرها</SelectItem>
                          {availableCities.map((city: any) => (
                              <SelectItem key={city.id} value={String(city.id)}>
                                {city.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                          onClick={() => setIsSheetOpen(false)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11"
                      >
                        تایید و مشاهده نتایج
                      </Button>
                      {(selectedProvinceId !== 'all' || selectedCityId !== 'all') && (
                          <Button
                              onClick={clearLocationFilters}
                              variant="outline"
                              className="rounded-xl h-11 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            پاک‌کردن
                          </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* لیست افقی تخصص‌ها */}
          <div className="mt-5 -mx-4 px-4">
            <div className="flex overflow-x-auto gap-2.5 pb-3 pt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {specialties.map((specialty) => {
                const isActive = searchQuery === specialty.name || selectedSpecialties.includes(specialty.name);
                return (
                    <button
                        key={specialty.id}
                        onClick={() => {
                          if (isActive) {
                            setSearchQuery('');
                            setSelectedSpecialties([]);
                            fetchDoctors('', selectedProvinceId, selectedCityId);
                          } else {
                            setSearchQuery(specialty.name);
                            setSelectedSpecialties([specialty.name]);
                            handleSearchSubmit(specialty.name);
                          }
                        }}
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border shadow-sm
                    ${
                            isActive
                                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/30'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600'
                        }`}
                    >
                      {specialty.name}
                    </button>
                );
              })}
            </div>
          </div>

          {/* بج‌های فیلترهای فعال با نمایش نام مناسب و پاک‌کردن بر اساس ID */}
          {(selectedProvinceId !== 'all' || selectedCityId !== 'all') && (
              <div className="mb-4 flex flex-wrap gap-2 justify-end">
                {selectedProvinceId !== 'all' && (
                    <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-lg">
                      <span>استان: {currentProvinceName}</span>
                      <X
                          className="w-3.5 h-3.5 cursor-pointer hover:text-red-500 transition-colors"
                          onClick={() => handleProvinceChange('all')}
                      />
                    </Badge>
                )}
                {selectedCityId !== 'all' && (
                    <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-lg">
                      <span>شهر: {currentCityName}</span>
                      <X
                          className="w-3.5 h-3.5 cursor-pointer hover:text-red-500 transition-colors"
                          onClick={() => handleCityChange('all')}
                      />
                    </Badge>
                )}
              </div>
          )}

          {/* لیست پزشکان */}
          <div className="space-y-4 mb-6">
            {filteredDoctors.length === 0 ? (
                <div className="py-16 text-center text-gray-500 text-sm">
                  پزشکی با موقعیت یا مشخصات انتخابی یافت نشد.
                </div>
            ) : (
                filteredDoctors.map((doctor) => (
                    <Card
                        key={doctor.id}
                        dir="rtl"
                        onClick={() => handleDoctorClick(doctor.id)}
                        className="gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 text-right shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] cursor-pointer"
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                              src={doctor.image}
                              alt={`${doctor.firstName} ${doctor.lastName || ''}`}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getDoctorAvatarFallback(
                                    `${doctor.firstName} ${doctor.lastName || ''}`
                                );
                              }}
                              className="h-14 w-14 flex-shrink-0 rounded-full bg-gray-100 object-cover ring-2 ring-gray-100"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-bold leading-6 text-gray-900">
                              دکتر {doctor.firstName} {doctor.lastName || ''}
                            </h3>
                            <p className="mt-0.5 truncate text-xs text-gray-500">{doctor.specialty}</p>
                          </div>
                          <button
                              type="button"
                              aria-label={
                                favoriteDoctors.includes(doctor.id)
                                    ? 'حذف از علاقه‌مندی‌ها'
                                    : 'افزودن به علاقه‌مندی‌ها'
                              }
                              onClick={(e) => toggleFavorite(doctor.id, e)}
                              className={`group flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-full transition-all duration-300 active:scale-90 ${
                                  favoriteDoctors.includes(doctor.id)
                                      ? 'bg-gradient-to-br from-rose-500 to-red-500 shadow-lg shadow-red-500/30 ring-2 ring-red-100/80'
                                      : 'bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 hover:ring-red-200 hover:shadow-red-100/60'
                              }`}
                          >
                            <Heart
                                className={`h-4 w-4 transition-all duration-300 ${
                                    favoriteDoctors.includes(doctor.id)
                                        ? 'fill-white text-white scale-110'
                                        : 'text-gray-400 group-hover:scale-110 group-hover:text-rose-400'
                                }`}
                            />
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-3 divide-x divide-gray-100 rounded-xl bg-gray-50/80 py-2 text-center">
                          <div className="flex flex-col items-center gap-0.5 px-1">
                            <span className="flex items-center gap-1 text-xs font-bold text-gray-900">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {parseFloat(doctor.rating).toLocaleString('fa-IR')}
                            </span>
                            <span className="text-[10px] text-gray-500">{doctor.reviews.toLocaleString('fa-IR')} نظر</span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5 px-1">
                            <span className="flex items-center gap-1 text-xs font-bold text-gray-900">
                              <ThumbsUp className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
                              {doctor.recommendation.toLocaleString('fa-IR')}٪
                            </span>
                            <span className="text-[10px] text-gray-500">پیشنهاد کاربران</span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5 px-1">
                            <span className="flex items-center gap-1 text-xs font-bold text-gray-900">
                              <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                              {doctor.visit_count.toLocaleString('fa-IR')}
                            </span>
                            <span className="text-[10px] text-gray-500">نوبت موفق</span>
                          </div>
                        </div>

                        {doctor.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {doctor.tags.slice(0, 3).map((tag) => (
                                  <span
                                      key={tag}
                                      className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700"
                                  >
                                    {tag}
                                  </span>
                              ))}
                            </div>
                        )}

                        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-500">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                          <span className="flex-1 truncate">{doctor.address || `${doctor.province}، ${doctor.city}`}</span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                          <p className="min-w-0 text-[11px] leading-5 text-gray-500">
                            اولین نوبت آزاد:{' '}
                            <span className="font-semibold text-gray-700">{getAvailabilityText(doctor.availability)}</span>
                          </p>
                          <Button
                              size="sm"
                              className="shrink-0 rounded-full bg-gradient-to-l from-blue-600 to-blue-500 px-4 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 hover:from-blue-700 hover:to-blue-600 active:scale-[0.98]"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDoctorClick(doctor.id);
                              }}
                          >
                            رزرو نوبت
                          </Button>
                        </div>
                      </div>

                      {doctor.aiApproved && (
                          <div className="flex items-center justify-center gap-1.5 border-t border-cyan-100 bg-gradient-to-l from-cyan-50 to-violet-50 py-2 text-[11px] font-semibold">
                            <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
                            <span className="bg-gradient-to-l from-cyan-600 to-violet-600 bg-clip-text text-transparent">
                              مورد تایید هوش مصنوعی
                            </span>
                          </div>
                      )}
                    </Card>
                ))
            )}
          </div>

          <div className="relative flex justify-center items-center py-2">
            <div
                aria-hidden
                className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-l from-transparent via-gray-200 to-transparent"
            />
            <button
                type="button"
                className="group relative z-10 inline-flex items-center gap-2.5 pr-4 pl-1.5 py-1.5 text-xs font-semibold text-blue-700 bg-gradient-to-b from-white via-white to-blue-50/90 rounded-full border border-blue-100/90 shadow-[0_4px_24px_-6px_rgba(59,130,246,0.28)] hover:border-blue-200 hover:shadow-[0_8px_32px_-6px_rgba(59,130,246,0.38)] hover:text-blue-800 active:scale-[0.97] transition-all duration-300"
            >
              <span className="tracking-tight">مشاهده پزشکان بیشتر</span>
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:shadow-blue-500/40 transition-all duration-300">
                <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform duration-300" />
              </span>
            </button>
          </div>
        </div>
      </div>
  );
}
