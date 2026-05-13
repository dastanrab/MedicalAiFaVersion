import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin, Filter, Star, Calendar, FileText, Heart } from 'lucide-react';
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
    specialty: 'متخصص قلب',
    city: 'چیانگ‌مای',
    province: 'چیانگ‌مای',
    gender: 'مرد',
    appointments: 989,
    medicalCode: 'MD-2024-002',
    rank: 'متخصص',
    rating: 4.9,
    reviews: 189,
    image: 'https://cdn.tarhpik.com/5_Preview/1404/6/30/053235/a-male-doctor-in-a-white-coat-and-glasses-free-png-400.webp',
    experience: '۱۵ سال سابقه',
    availability: 'فردا در دسترس',
  },
  {
    id: 5,
    firstName: 'لیلی',
    lastName: 'اوتادی',
    specialty: 'جراح ارتوپد',
    city: 'شیراز',
    province: 'فارس',
    gender: 'زن',
    appointments: 1098,
    medicalCode: 'MD-2024-005',
    rank: 'متخصص ارشد',
    rating: 4.8,
    reviews: 201,
    image: 'https://cdn.nody.ir/files/2025/03/31/nody-%D8%B9%DA%A9%D8%B3-%D8%AE%D8%A7%D9%86%D9%85-%D8%AF%DA%A9%D8%AA%D8%B1-%D9%81%D8%A7%D9%86%D8%AA%D8%B2%DB%8C-%D8%A8%D8%A7-%DA%A9%DB%8C%D9%81%DB%8C%D8%AA-%D8%A8%D8%A7%D9%84%D8%A7-%D8%A8%D8%B1%D8%A7%DB%8C-%D9%BE%D8%B1%D9%88%D9%81%D8%A7%DB%8C%D9%84-1743407710.webp',
    experience: '۱۸ سال سابقه',
    availability: 'فردا در دسترس',
  },
];

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

  const filteredDoctors = doctors.filter((doctor) => {
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
      <div className="h-full bg-gradient-to-b from-blue-50 to-white overflow-y-auto pb-24 text-right font-[IRANSansXFaNum]">
        <AppBar title="پیدا کردن پزشک" />

        <div className="px-6 pt-24 py-8">
          <div className="mb-6">
            <h1 className="text-3xl mb-2 text-gray-900">پیدا کردن پزشک</h1>
            <p className="text-gray-600">جستجو بر اساس نام، تخصص یا موقعیت</p>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                  placeholder="جستجوی پزشک..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 h-12 text-right"
              />
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-12 px-4">
                  <Filter className="w-5 h-5" />
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

          {/* Results Count */}
          <p className="text-sm text-gray-600 mb-4">
            {filteredDoctors.length} پزشک یافت شد
          </p>

          {/* Doctor Cards */}
          <div className="space-y-4 mb-6">
            {filteredDoctors.map((doctor) => (
                <Card
                    key={doctor.id}
                    onClick={() => navigate(`/doctor/${doctor.id}`)}
                    className="p-4 shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer text-right"
                >
                  <div className="flex gap-4 mb-2 items-start">
                    <img
                        src={doctor.image}
                        alt={`${doctor.firstName} ${doctor.lastName}`}
                        className="w-28 h-28 rounded-2xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg text-gray-900 mb-1">دکتر {doctor.firstName} {doctor.lastName}</h3>
                      <div className="flex items-center gap-2 mb-1 justify-end">
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs rounded-full">
                          {doctor.rank}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{doctor.specialty}</p>

                      <div className="flex items-center gap-2 justify-end">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 ml-1" />
                        <span className="text-sm text-gray-900">{doctor.rating}</span>
                        <span className="text-xs text-gray-500">({doctor.reviews} نظر)</span>
                      </div>
                    </div>
                    <button
                        onClick={(e) => toggleFavorite(doctor.id, e)}
                        className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
                    >
                      <Heart
                          className={`w-5 h-5 ${
                              favoriteDoctors.includes(doctor.id)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-gray-400'
                          }`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-2 text-gray-600">
                    <div className="flex items-center justify-end">
                      <MapPin className="w-3.5 h-3.5 ml-1.5 text-blue-500" />
                      <span>{doctor.city}</span>
                    </div>
                    <div className="flex items-center justify-end">
                      <Calendar className="w-3.5 h-3.5 ml-1.5 text-blue-500" />
                      <span>{doctor.appointments} نوبت</span>
                    </div>
                    <div className="flex items-center justify-end">
                      <FileText className="w-3.5 h-3.5 ml-1.5 text-blue-500" />
                      <span>{doctor.medicalCode}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Badge className="bg-green-100 text-green-700 border-green-200 rounded-full">
                      {doctor.availability}
                    </Badge>
                    <Button
                        size="sm"
                        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6"
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
          <Button variant="outline" className="w-full h-12 text-lg">
            مشاهده پزشکان بیشتر
          </Button>
        </div>
      </div>
  );
}
