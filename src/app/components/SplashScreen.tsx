import { useEffect, useState } from 'react';
import './SplashScreen.css';

const SESSION_KEY = 'medira:splash-shown';
const MIN_DURATION_MS = 2200;
const EXIT_DURATION_MS = 450;

const LOGO_PATH =
    'M131.15.11c26.27-1.41,51.44,11.1,67.88,30.99,20.17,24.41,21.01,60.09,42.16,85.26,21.4,25.46,91.2,54.4,123.97,50.25,23.65-3,74-24.3,92.47-39.55,38.63-31.89,28.7-88.02,75-115.36,63.95-37.77,140.02,22.48,119.63,93.53-13.83,48.19-81.6,71.69-47.68,128.25,22.41,37.38,60.12,53.75,49.94,107.35-17.74,93.34-154.2,85.7-162.11-7.45-5.05-59.52,46.41-72.85,60.4-115.75,14.05-43.11-39.57-77.25-79.6-58.11-47.66,22.79-32.23,77.94-60.87,112.6-31.49,38.1-93.23,34.48-120.33-7-15.85-24.26-12.99-53.99-27.3-78.62-22.46-38.66-77.35-46.72-102.28-6.17-29.96,48.72,40.83,80.05,52.38,125.16,25.28,98.75-117.95,143.99-154.71,51.86-20.78-52.09,8.05-74.96,36.01-111.31,53.03-68.96-23.42-85.12-39.09-141.98C43.22,54.05,79.1,2.89,131.15.11';

function shouldShow(): boolean {
    try {
        return sessionStorage.getItem(SESSION_KEY) !== '1';
    } catch {
        return true;
    }
}

/**
 * Animated launch screen shown once per app session, on top of the app
 * (so routes can load behind it). Visually continues the native splash.
 */
export function SplashScreen() {
    const [phase, setPhase] = useState<'visible' | 'leaving' | 'done'>(() =>
        shouldShow() ? 'visible' : 'done',
    );

    useEffect(() => {
        if (phase !== 'visible') return;
        try {
            sessionStorage.setItem(SESSION_KEY, '1');
        } catch {
            // storage unavailable — splash simply shows again next time
        }
        const leave = window.setTimeout(() => setPhase('leaving'), MIN_DURATION_MS);
        return () => window.clearTimeout(leave);
    }, [phase]);

    useEffect(() => {
        if (phase !== 'leaving') return;
        const done = window.setTimeout(() => setPhase('done'), EXIT_DURATION_MS);
        return () => window.clearTimeout(done);
    }, [phase]);

    if (phase === 'done') return null;

    return (
        <div
            className={`medira-splash ${phase === 'leaving' ? 'medira-splash--leaving' : ''}`}
            role="status"
            aria-label="در حال بارگذاری مدیرا"
            dir="rtl"
        >
            <div className="medira-splash__glow" />

            <div className="medira-splash__center">
                <div className="medira-splash__mark">
                    <span className="medira-splash__ring" />
                    <span className="medira-splash__ring medira-splash__ring--late" />
                    <svg viewBox="-10 -10 748 500" className="medira-splash__logo" aria-hidden="true">
                        <defs>
                            <linearGradient id="medira-splash-grad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#6fd3f7" />
                                <stop offset="100%" stopColor="#3bb4ea" />
                            </linearGradient>
                        </defs>
                        <path d={LOGO_PATH} fill="url(#medira-splash-grad)" />
                    </svg>
                </div>

                <h1 className="medira-splash__title">مدیرا</h1>
                <p className="medira-splash__tagline">خدمات پزشکی با هوش مصنوعی</p>
            </div>

            <div className="medira-splash__footer">
                <div className="medira-splash__progress">
                    <span />
                </div>
                <span className="medira-splash__brand">mediraai</span>
            </div>
        </div>
    );
}
