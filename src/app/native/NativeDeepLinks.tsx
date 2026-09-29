import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { deepLinkToPath } from './appDeepLink';

export function NativeDeepLinks() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const open = (url: string | undefined) => {
            const path = url ? deepLinkToPath(url) : null;
            if (path) navigate(path, { replace: true });
        };

        // اپ بسته بوده و با لینک باز شده
        void CapacitorApp.getLaunchUrl().then((result) => open(result?.url));

        // اپ در پس‌زمینه بوده
        const listener = CapacitorApp.addListener('appUrlOpen', ({ url }) => open(url));

        return () => {
            void Promise.resolve(listener).then((handle) => handle.remove());
        };
    }, [navigate]);

    return null;
}
