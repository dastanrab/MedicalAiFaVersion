import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export function NativeBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        navigate(-1);
        return;
      }

      const path = pathRef.current;
      if (path === '/login' || path === '/' || path === '/home') {
        CapacitorApp.exitApp();
        return;
      }

      navigate(-1);
    });

    return () => {
      listener.then((handle) => handle.remove());
    };
  }, [navigate]);

  return null;
}
