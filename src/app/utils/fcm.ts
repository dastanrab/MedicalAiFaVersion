// src/utils/fcm.ts
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDrw8eckSFHCGQdAeMkyjsIsgEAb6rgcQs",
    authDomain: "mediraai.firebaseapp.com",
    projectId: "mediraai",
    storageBucket: "mediraai.firebasestorage.app",
    messagingSenderId: "784151921757",
    appId: "1:784151921757:web:a3eccf0e65a1a380c4b9b4",
    measurementId: "G-H684MPDSR5"
};

const app = initializeApp(firebaseConfig);

// تابع کمکی برای ارسال توکن به لاراول (مشترک بین وب و اندروید)
async function sendTokenToBackend(fcmToken: string, accessToken: string) {
    const response = await fetch("https://api.mediraai.com/api/user/fcm-token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            fcm_token: fcmToken,
        }),
    });

    if (response.ok) {
        console.log("توکن FCM با موفقیت به سرور ارسال شد.");
    } else {
        console.error("خطا در ثبت توکن در سرور:", await response.text());
    }
}

export async function syncFcmTokenWithBackend(accessToken: string) {
    try {
        // ۱. اگر برنامه در محیط اندروید/iOS (Capacitor) اجرا شده باشد
        if (Capacitor.isNativePlatform()) {
            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === "prompt") {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== "granted") {
                console.warn("کاربر در موبایل مجوز نوتیفیکیشن را تایید نکرد.");
                return;
            }

            await PushNotifications.removeAllListeners();

            PushNotifications.addListener("registration", async (token) => {
                await sendTokenToBackend(token.value, accessToken);
            });

            PushNotifications.addListener("registrationError", (err) => {
                console.error("خطا در دریافت توکن نیتیو:", err.error);
            });

            await PushNotifications.register();
            return;
        }

        // ۲. اگر برنامه در مرورگر وب اجرا شده باشد
        const supported = await isSupported();
        if (!supported || !("Notification" in window)) {
            console.warn("این مرورگر از نوتیفیکیشن وب پشتیبانی نمی‌کند.");
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("کاربر مجوز نوتیفیکیشن را تایید نکرد.");
            return;
        }

        const messaging = getMessaging(app);
        const fcmToken = await getToken(messaging, {
            vapidKey: "BMFG49CMfDtw9BjItnU6Bn5Lj-K_btX-RH7JwUFq-uNy1Sca75kz-IyTjLhkz5BOgYWRoPFIAuKNmY8dGqXMviI",
        });

        if (!fcmToken) return;

        await sendTokenToBackend(fcmToken, accessToken);
    } catch (error) {
        console.error("خطا در دریافت یا ارسال توکن FCM:", error);
    }
}