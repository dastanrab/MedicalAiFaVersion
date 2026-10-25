// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyDrw8eckSFHCGQdAeMkyjsIsgEAb6rgcQs",
    authDomain: "mediraai.firebaseapp.com",
    projectId: "mediraai",
    storageBucket: "mediraai.firebasestorage.app",
    messagingSenderId: "784151921757",
    appId: "1:784151921757:web:a3eccf0e65a1a380c4b9b4",
    measurementId: "G-H684MPDSR5"
});

const messaging = firebase.messaging();

// دریافت نوتیفیکیشن در زمانی که تب مرورگر در پس‌زمینه است
messaging.onBackgroundMessage((payload) => {
    console.log("نوتیفیکیشن در پس‌زمینه دریافت شد:", payload);

    const notificationTitle = payload.notification?.title || "پیام جدید";
    const notificationOptions = {
        body: payload.notification?.body || "",
        icon: "/logo.svg", // آیکون سایت شما
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});