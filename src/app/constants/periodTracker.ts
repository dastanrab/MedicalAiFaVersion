export const MOODS = [
    { id: 'happy', emoji: '😊', label: 'شاد' },
    { id: 'calm', emoji: '😌', label: 'آرام' },
    { id: 'sad', emoji: '😔', label: 'غمگین' },
    { id: 'angry', emoji: '😠', label: 'عصبی' },
    { id: 'tired', emoji: '😴', label: 'خسته' },
];

export const FOODS = [
    { id: 'sweet', emoji: '🍫', label: 'شیرینی' },
    { id: 'salty', emoji: '🍟', label: 'شوری' },
    { id: 'sour', emoji: '🍋', label: 'ترشی' },
    { id: 'spicy', emoji: '🌶️', label: 'تندی' },
];

export const PHYSICAL_SYMPTOMS = [
    { id: 'cramps', emoji: '😖', label: 'درد شکم' },
    { id: 'headache', emoji: '🤕', label: 'سردرد' },
    { id: 'bloating', emoji: '🫃', label: 'نفخ' },
    { id: 'back_pain', emoji: '🔻', label: 'کمر درد' },
    { id: 'fatigue', emoji: '😴', label: 'خستگی' },
    { id: 'nausea', emoji: '🤢', label: 'تهوع' },
    { id: 'breast_tenderness', emoji: '💗', label: 'حساسیت سینه' },
    { id: 'acne', emoji: '🔴', label: 'جوش' },
];

export const WORKOUTS = [
    {
        id: 'yoga',
        title: 'یوگا و کشش',
        duration: '۱۰ دقیقه',
        intensity: 'سبک',
        emoji: '🧘‍♀️',
        steps: [
            { title: 'تنفس عمیق', description: 'چهار شماره دم، چهار شماره بازدم. تمرکز روی آرامش شکم.', duration: 60 },
            { title: 'کشش گردن', description: 'به آرامی گردن را به چپ و راست بچرخانید و هر سمت ۵ ثانیه نگه دارید.', duration: 45 },
            { title: 'کشش گربه-گاو', description: 'روی چهار دست و پا، کمر را بالا و پایین ببرید.', duration: 90 },
            { title: 'حالت کودک', description: 'زانو بزنید و بالاتنه را روی ران‌ها خم کنید، دست‌ها کشیده.', duration: 60 },
            { title: 'شروع مجدد', description: 'دوباره یک نفس عمیق بکشید و به آرامی حرکت را تمام کنید.', duration: 30 },
        ],
    },
    {
        id: 'pilates',
        title: 'پیلاتس ملایم',
        duration: '۱۲ دقیقه',
        intensity: 'متوسط',
        emoji: '🤸‍♀️',
        steps: [
            { title: 'پل باسن', description: 'به پشت بخوابید، زانوها خم، باسن را بالا ببرید و ۵ ثانیه نگه دارید.', duration: 60 },
            { title: 'کشش پا', description: 'یک پا را صاف بالا بیاورید و چند ثانیه بکشید.', duration: 60 },
            { title: 'چرخش ستون فقرات', description: 'نشسته، به آرامی بالاتنه را بچرخانید و دست را به زانوی مخالف بزنید.', duration: 90 },
            { title: 'کشش پهلو', description: 'ایستاده یا نشسته، یک دست را بالا ببرید و به سمت مخالف خم شوید.', duration: 45 },
            { title: 'آرام‌سازی نهایی', description: 'به پشت دراز بکشید و تمام بدن را شل کنید.', duration: 60 },
        ],
    },
    {
        id: 'cardio',
        title: 'پیاده‌روی سبک',
        duration: '۱۵ دقیقه',
        intensity: 'سبک',
        emoji: '🚶‍♀️',
        steps: [
            { title: 'گرم کردن', description: 'درجا قدم بزنید و دست‌ها را بچرخانید.', duration: 90 },
            { title: 'قدم‌های سریع', description: 'با سرعت متوسط راه بروید و نفس عمیق بکشید.', duration: 180 },
            { title: 'حرکت زانو بلند', description: 'زانوها را یکی در میان بالا بیاورید.', duration: 60 },
            { title: 'حرکت پاشنه به باسن', description: 'پاشنه پا را به باسن نزدیک کنید.', duration: 60 },
            { title: 'سرد کردن', description: 'آهسته قدم بزنید و تنفس را منظم کنید.', duration: 90 },
        ],
    },
];

export const WEEK_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];