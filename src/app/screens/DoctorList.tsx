import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin, Filter, Star, ChevronDown, ThumbsUp, BadgeCheck, Stethoscope, Heart, Sparkles } from 'lucide-react';
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
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { AppBar } from '../components/AppBar';

const doctors = [
  {
    id: 2,
    firstName: 'شهاب',
    lastName: 'عباسی',
    specialty: 'تخصص قلب و عروق',
    city: 'مشهد',
    province: 'خراسان رضوی',
    gender: 'مرد',
    appointments: 989,
    medicalCode: 'MD-2024-002',
    rank: 'متخصص',
    rating: 4.9,
    reviews: 189,
    recommendation: 94,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=faces&auto=format',
    experience: '۱۵ سال سابقه',
    availability: 'فردا',
    address: 'مشهد، بلوار وکیل‌آباد، بین ۲۴ و ۲۶، ساختمان پزشکان پارس',
    tags: ['پوشش دهی بیمه', 'کمترین معطلی'],
  },
  {
    id: 5,
    firstName: 'لیلی',
    lastName: 'اوتادی',
    specialty: 'تخصص ارتوپدی',
    city: 'مشهد',
    province: 'خراسان رضوی',
    gender: 'زن',
    appointments: 1098,
    medicalCode: 'MD-2024-005',
    rank: 'متخصص ارشد',
    rating: 4.8,
    reviews: 201,
    recommendation: 96,
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=faces&auto=format',
    experience: '۱۸ سال سابقه',
    availability: 'فردا',
    address: 'مشهد، خیابان احمدآباد، نبش فریبا، مجتمع درمانی سپهر',
    tags: ['پوشش دهی بیمه', 'کمترین معطلی'],
  },
  {
    id: 3,
    firstName: 'رضا',
    lastName: 'کریمی',
    specialty: 'تخصص پوست و مو',
    city: 'مشهد',
    province: 'خراسان رضوی',
    gender: 'مرد',
    appointments: 756,
    medicalCode: 'MD-2024-003',
    rank: 'متخصص',
    rating: 4.7,
    reviews: 142,
    recommendation: 91,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces&auto=format&q=80',
    experience: '۱۰ سال سابقه',
    availability: 'پس‌فردا',
    address: 'مشهد، بلوار سجاد، مجتمع پزشکی آریا، طبقه ۴',
    tags: ['پوشش دهی بیمه', 'کمترین معطلی'],
  },
  {
    id: 4,
    firstName: 'مینا',
    lastName: 'رضایی',
    specialty: 'تخصص اطفال',
    city: 'مشهد',
    province: 'خراسان رضوی',
    gender: 'زن',
    appointments: 1243,
    medicalCode: 'MD-2024-004',
    rank: 'متخصص ارشد',
    rating: 4.9,
    reviews: 318,
    recommendation: 97,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=faces&auto=format',
    experience: '۱۴ سال سابقه',
    availability: 'فردا',
    address: 'مشهد، خیابان کوهسنگی، پلاک ۱۲، کلینیک شفا',
    tags: ['پوشش دهی بیمه', 'کمترین معطلی'],
  },
  {
    id: 6,
    firstName: 'امیر',
    lastName: 'حسینی',
    specialty: 'پزشک عمومی',
    city: 'مشهد',
    province: 'خراسان رضوی',
    gender: 'مرد',
    appointments: 2104,
    medicalCode: 'MD-2024-006',
    rank: 'پزشک ارشد',
    rating: 4.6,
    reviews: 87,
    recommendation: 89,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=faces&auto=format',
    experience: '۸ سال سابقه',
    availability: 'امروز',
    address: 'مشهد، بلوار فردوسی، نرسیده به چهارراه فردوسی، ساختمان نور',
    tags: ['پوشش دهی بیمه', 'کمترین معطلی'],
  },
  {
    id: 7,
    firstName: 'نرگس',
    lastName: 'محمدی',
    specialty: 'جراح ارتوپد',
    city: 'مشهد',
    province: 'خراسان رضوی',
    gender: 'زن',
    appointments: 867,
    medicalCode: 'MD-2024-007',
    rank: 'متخصص',
    rating: 4.8,
    reviews: 156,
    recommendation: 93,
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=faces&auto=format',
    experience: '۱۲ سال سابقه',
    availability: 'فردا',
    address: 'مشهد، خیابان دانشگاه، جنب پارک دانشجو، مرکز درمانگاه ایران',
    tags: ['پوشش دهی بیمه', 'کمترین معطلی'],
  },
];

function getDoctorAvatarFallback(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=144&font-size=0.4`;
}

const doctorsWithMeta = doctors.map((doctor, index) => ({
  ...doctor,
  aiApproved: index === 0 || (doctor.id * 7 + 3) % 5 < 3,
}));

export function DoctorList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedRanks, setSelectedRanks] = useState<string[]>([]);
  const [favoriteDoctors, setFavoriteDoctors] = useState<number[]>([]);
  const specialties = ['پزشک عمومی', 'متخصص قلب', 'متخصص کودکان', 'متخصص پوست', 'جراح ارتوپد'];
  const provinces = ['بانکوک', 'چیانگ‌مای', 'پوکت', 'چنبوری'];
  const cities = ['بانکوک', 'چیانگ‌مای', 'پوکت', 'پاتایا'];
  const ranks = ['پزشک', 'پزشک ارشد', 'متخصص', 'متخصص ارشد'];

  const filteredDoctors = doctorsWithMeta.filter((doctor) => {
    const matchesSearch =
        doctor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProvince = selectedProvince === 'all' || doctor.province === selectedProvince;
    const matchesCity = selectedCity === 'all' || doctor.city === selectedCity;
    const matchesGender = selectedGender === 'all' || doctor.gender === selectedGender;
    const matchesSpecialty = selectedSpecialties.length === 0 || selectedSpecialties.includes(doctor.specialty);
    const matchesRank = selectedRanks.length === 0 || selectedRanks.includes(doctor.rank);

    return matchesSearch && matchesProvince && matchesCity && matchesGender && matchesSpecialty && matchesRank;
  });

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
        prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
    );
  };

  const toggleRank = (rank: string) => {
    setSelectedRanks((prev) => (prev.includes(rank) ? prev.filter((r) => r !== rank) : [...prev, rank]));
  };

  const clearFilters = () => {
    setSelectedProvince('all');
    setSelectedCity('all');
    setSelectedGender('all');
    setSelectedSpecialties([]);
    setSelectedRanks([]);
  };

  const toggleFavorite = (doctorId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteDoctors((prev) =>
      prev.includes(doctorId) ? prev.filter((id) => id !== doctorId) : [...prev, doctorId]
    );
  };

  return (
      <div className="h-full bg-gradient-to-b from-blue-50 to-white overflow-y-auto pb-24 text-right font-[YekanBakhFaNum]">
        <AppBar />

        <div className="px-6 pt-24 py-8">
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
                    جستجو بر اساس نام، تخصص یا موقعیت
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 -mt-9 flex gap-2.5 px-1">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
                <Input
                  placeholder="جستجوی پزشک..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 rounded-full border-0 bg-white pr-11 text-right shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-300"
                />
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 w-12 shrink-0 rounded-full border-0 bg-white p-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 hover:bg-blue-50 hover:ring-blue-200"
                  >
                    <Filter className="h-5 w-5 text-blue-600" />
                  </Button>
                </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] overflow-hidden">
                <SheetHeader>
                  <SheetTitle>فیلتر پزشکان</SheetTitle>
                  <SheetDescription>نتایج جستجو را دقیق‌تر کنید</SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6 px-4 overflow-y-auto max-h-[calc(80vh-120px)] pb-4">
                  {/* Search by Name */}
                  <div>
                    <h3 className="text-lg mb-3 text-gray-900">جستجو بر اساس نام</h3>
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                          placeholder="نام پزشک را وارد کنید..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pr-10 text-right"
                      />
                    </div>
                  </div>

                  {/* Province Filter */}
                  <div>
                    <h3 className="text-lg mb-3 text-gray-900">استان</h3>
                    <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="انتخاب استان">
                          {selectedProvince === 'all' ? 'همه استان‌ها' : selectedProvince}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">همه استان‌ها</SelectItem>
                        {provinces.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* City Filter */}
                  <div>
                    <h3 className="text-lg mb-3 text-gray-900">شهر</h3>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="انتخاب شهر">
                          {selectedCity === 'all' ? 'همه شهرها' : selectedCity}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">همه شهرها</SelectItem>
                        {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Gender Filter */}
                  <div>
                    <h3 className="text-lg mb-3 text-gray-900">جنسیت</h3>
                    <Select value={selectedGender} onValueChange={setSelectedGender}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="انتخاب جنسیت">
                          {selectedGender === 'all' ? 'همه' : selectedGender}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">همه</SelectItem>
                        <SelectItem value="Male">مرد</SelectItem>
                        <SelectItem value="Female">زن</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Specialty Filter */}
                  <div>
                    <h3 className="text-lg mb-3 text-gray-900">تخصص</h3>
                    <div className="space-y-3">
                      {specialties.map((specialty) => (
                          <div key={specialty} className="flex items-center">
                            <Checkbox
                                id={specialty}
                                checked={selectedSpecialties.includes(specialty)}
                                onCheckedChange={() => toggleSpecialty(specialty)}
                            />
                            <Label htmlFor={specialty} className="mr-2 cursor-pointer">
                              {specialty}
                            </Label>
                          </div>
                      ))}
                    </div>
                  </div>

                  {/* Rank Filter */}
                  <div>
                    <h3 className="text-lg mb-3 text-gray-900">سمت</h3>
                    <div className="space-y-3">
                      {ranks.map((rank) => (
                          <div key={rank} className="flex items-center">
                            <Checkbox
                                id={rank}
                                checked={selectedRanks.includes(rank)}
                                onCheckedChange={() => toggleRank(rank)}
                            />
                            <Label htmlFor={rank} className="mr-2 cursor-pointer">
                              {rank}
                            </Label>
                          </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={clearFilters} variant="outline" className="w-full">
                    پاک کردن همه فیلترها
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedProvince !== 'all' ||
              selectedCity !== 'all' ||
              selectedGender !== 'all' ||
              selectedSpecialties.length > 0 ||
              selectedRanks.length > 0) && (
              <div className="mb-4 flex flex-wrap gap-2 justify-end">
                {selectedProvince !== 'all' && (
                    <Badge key={selectedProvince} variant="secondary">
                      {selectedProvince}
                    </Badge>
                )}
                {selectedCity !== 'all' && (
                    <Badge key={selectedCity} variant="secondary">
                      {selectedCity}
                    </Badge>
                )}
                {selectedGender !== 'all' && (
                    <Badge key={selectedGender} variant="secondary">
                      {selectedGender}
                    </Badge>
                )}
                {selectedSpecialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                ))}
                {selectedRanks.map((rank) => (
                    <Badge key={rank} variant="secondary">
                      {rank}
                    </Badge>
                ))}
              </div>
          )}

          {/* Doctor Cards */}
          <div className="space-y-4 mb-6">
            {filteredDoctors.map((doctor) => (
                <Card
                    key={doctor.id}
                    dir="rtl"
                    onClick={() => navigate(`/doctor/${doctor.id}`)}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer text-right"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <img
                      src={doctor.image}
                      alt={`${doctor.firstName} ${doctor.lastName}`}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getDoctorAvatarFallback(
                          `${doctor.firstName} ${doctor.lastName}`
                        );
                      }}
                      className="h-[72px] w-[72px] flex-shrink-0 rounded-full bg-gray-100 object-cover ring-2 ring-gray-100"
                    />
                    <div className="min-w-0 flex-1 space-y-1.5 text-right">
                      <h3 className="text-base font-bold text-gray-900 leading-snug">
                        دکتر {doctor.firstName} {doctor.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{doctor.specialty}</p>

                      <div className="flex items-center gap-1.5 text-sm">
                        <Star className="h-4 w-4 flex-shrink-0 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-gray-900">{doctor.rating.toLocaleString('fa-IR')}</span>
                        <span className="text-gray-500">({doctor.reviews.toLocaleString('fa-IR')} نظر)</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <ThumbsUp className="h-4 w-4 flex-shrink-0 fill-emerald-500 text-emerald-500" />
                        <span>{doctor.recommendation.toLocaleString('fa-IR')}٪ پیشنهاد کاربران</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <BadgeCheck className="h-4 w-4 flex-shrink-0 text-blue-500" />
                        <span>{doctor.appointments.toLocaleString('fa-IR')} نوبت موفق</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-center self-start">
                      <button
                        type="button"
                        aria-label={
                          favoriteDoctors.includes(doctor.id)
                            ? 'حذف از علاقه‌مندی‌ها'
                            : 'افزودن به علاقه‌مندی‌ها'
                        }
                        onClick={(e) => toggleFavorite(doctor.id, e)}
                        className={`group flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 active:scale-90 ${
                          favoriteDoctors.includes(doctor.id)
                            ? 'bg-gradient-to-br from-rose-500 to-red-500 shadow-lg shadow-red-500/30 ring-2 ring-red-100/80'
                            : 'bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 hover:ring-red-200 hover:shadow-red-100/60'
                        }`}
                      >
                        <Heart
                          className={`h-[18px] w-[18px] transition-all duration-300 ${
                            favoriteDoctors.includes(doctor.id)
                              ? 'fill-white text-white scale-110'
                              : 'text-gray-400 group-hover:scale-110 group-hover:text-rose-400'
                          }`}
                        />
                      </button>
                      {doctor.aiApproved && (
                        <span className="mt-3 inline-flex flex-nowrap items-center gap-1.5 text-[10px] font-semibold leading-snug">
                          <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
                          <span className="bg-gradient-to-l from-cyan-600 to-violet-600 bg-clip-text text-transparent">
                            مورد تایید هوش مصنوعی
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="my-1 h-px bg-gray-100" />

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {doctor.tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                        >
                          {tag}
                        </span>
                    ))}
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-xs text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                    <span className="flex-1 truncate">{doctor.address}</span>
                  </div>

                  {/* Footer */}
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-500 text-right">
                      اولین نوبت آزاد مطب: <span className="font-medium text-gray-700">{doctor.availability}</span>
                    </p>
                    <Button
                        size="sm"
                        className="shrink-0 rounded-full bg-gradient-to-l from-blue-600 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 hover:from-blue-700 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/35 active:scale-[0.98] transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/doctor/${doctor.id}`);
                        }}
                    >
                      رزرو نوبت
                    </Button>
                  </div>
                </Card>
            ))}
          </div>

          {/* View More Button */}
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
