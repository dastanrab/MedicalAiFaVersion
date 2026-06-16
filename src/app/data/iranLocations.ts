export interface Province {
  id: number;
  name: string;
}

export const iranProvinces: Province[] = [
  { id: 1,  name: 'تهران' },
  { id: 2,  name: 'اصفهان' },
  { id: 3,  name: 'فارس' },
  { id: 4,  name: 'خراسان رضوی' },
  { id: 5,  name: 'خوزستان' },
  { id: 6,  name: 'آذربایجان شرقی' },
  { id: 7,  name: 'مازندران' },
  { id: 8,  name: 'کرمان' },
  { id: 9,  name: 'آذربایجان غربی' },
  { id: 10, name: 'گیلان' },
  { id: 11, name: 'همدان' },
  { id: 12, name: 'کرمانشاه' },
  { id: 13, name: 'مرکزی' },
  { id: 14, name: 'لرستان' },
  { id: 15, name: 'سیستان و بلوچستان' },
  { id: 16, name: 'اردبیل' },
  { id: 17, name: 'کردستان' },
  { id: 18, name: 'یزد' },
  { id: 19, name: 'هرمزگان' },
  { id: 20, name: 'قم' },
  { id: 21, name: 'گلستان' },
  { id: 22, name: 'قزوین' },
  { id: 23, name: 'زنجان' },
  { id: 24, name: 'سمنان' },
  { id: 25, name: 'بوشهر' },
  { id: 26, name: 'چهارمحال و بختیاری' },
  { id: 27, name: 'ایلام' },
  { id: 28, name: 'کهگیلویه و بویراحمد' },
  { id: 29, name: 'خراسان شمالی' },
  { id: 30, name: 'خراسان جنوبی' },
  { id: 31, name: 'البرز' },
];

export interface City {
  id: number;
  name: string;
  provinceId: number;
}

export const iranCitiesByProvince: Record<number, City[]> = {
  1: [
    { id: 1,  name: 'تهران',      provinceId: 1 },
    { id: 2,  name: 'شهریار',     provinceId: 1 },
    { id: 3,  name: 'ری',         provinceId: 1 },
    { id: 4,  name: 'ورامین',     provinceId: 1 },
    { id: 5,  name: 'پاکدشت',     provinceId: 1 },
  ],
  2: [
    { id: 6,  name: 'اصفهان',     provinceId: 2 },
    { id: 7,  name: 'کاشان',      provinceId: 2 },
    { id: 8,  name: 'نجف‌آباد',   provinceId: 2 },
    { id: 9,  name: 'خمینی‌شهر',  provinceId: 2 },
  ],
  3: [
    { id: 10, name: 'شیراز',      provinceId: 3 },
    { id: 11, name: 'مرودشت',     provinceId: 3 },
    { id: 12, name: 'جهرم',       provinceId: 3 },
    { id: 13, name: 'کازرون',     provinceId: 3 },
  ],
  4: [
    { id: 14, name: 'مشهد',             provinceId: 4 },
    { id: 15, name: 'نیشابور',          provinceId: 4 },
    { id: 16, name: 'سبزوار',           provinceId: 4 },
    { id: 17, name: 'تربت حیدریه',      provinceId: 4 },
  ],
  5: [
    { id: 18, name: 'اهواز',      provinceId: 5 },
    { id: 19, name: 'آبادان',     provinceId: 5 },
    { id: 20, name: 'خرمشهر',     provinceId: 5 },
    { id: 21, name: 'دزفول',      provinceId: 5 },
    { id: 22, name: 'اندیمشک',    provinceId: 5 },
  ],
  6: [
    { id: 23, name: 'تبریز',      provinceId: 6 },
    { id: 24, name: 'مراغه',      provinceId: 6 },
    { id: 25, name: 'مرند',       provinceId: 6 },
    { id: 26, name: 'میانه',      provinceId: 6 },
  ],
  7: [
    { id: 27, name: 'ساری',       provinceId: 7 },
    { id: 28, name: 'بابل',       provinceId: 7 },
    { id: 29, name: 'آمل',        provinceId: 7 },
    { id: 30, name: 'قائم‌شهر',   provinceId: 7 },
    { id: 31, name: 'بابلسر',     provinceId: 7 },
  ],
  8: [
    { id: 32, name: 'کرمان',      provinceId: 8 },
    { id: 33, name: 'رفسنجان',    provinceId: 8 },
    { id: 34, name: 'سیرجان',     provinceId: 8 },
    { id: 35, name: 'بم',         provinceId: 8 },
  ],
  9: [
    { id: 36, name: 'ارومیه',     provinceId: 9 },
    { id: 37, name: 'خوی',        provinceId: 9 },
    { id: 38, name: 'مهاباد',     provinceId: 9 },
    { id: 39, name: 'میاندوآب',   provinceId: 9 },
  ],
  10: [
    { id: 40, name: 'رشت',        provinceId: 10 },
    { id: 41, name: 'بندر انزلی', provinceId: 10 },
    { id: 42, name: 'لاهیجان',    provinceId: 10 },
    { id: 43, name: 'لنگرود',     provinceId: 10 },
  ],
  // استان‌های 11-30 در DB موجود نیستن — ID موقت یا حذف کن
  31: [
    { id: 44, name: 'کرج',        provinceId: 31 },
    { id: 45, name: 'فردیس',      provinceId: 31 },
    { id: 46, name: 'نظرآباد',    provinceId: 31 },
    { id: 47, name: 'ساوجبلاغ',   provinceId: 31 },
  ],
};

