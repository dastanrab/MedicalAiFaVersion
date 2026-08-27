# لندینگ مدیرا AI

لندینگ مستقل فارسی و راست‌چین مدیرا AI، ساخته‌شده با React، TypeScript، Tailwind CSS و Vite.

## اجرا

```bash
cd landing-page
npm install
npm run dev
```

برای build تولید:

```bash
npm run build
```

## آدرس برنامه اصلی

دکمه‌های ورود به‌صورت پیش‌فرض به `http://localhost:5173/login` می‌روند. برای محیط‌های دیگر:

```bash
VITE_APP_URL=https://example.com/login npm run build
```

## دارایی‌های مشترک

برای حفظ هویت محصول، نسخه تأییدشده لوگو و فایل‌های فونت YekanBakhFaNum در پوشه `public` همین اپ
قرار گرفته‌اند؛ بنابراین build لندینگ به برنامه اصلی وابسته نیست.
