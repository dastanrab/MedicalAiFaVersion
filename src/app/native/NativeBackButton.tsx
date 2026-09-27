import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { useAuthStore } from '../store/authStore';
import { getHistoryIndex } from '../navigation/appHistory';

function isAuthPath(path: string) {
  return path === '/' || path === '/login' || path === '/verify';
}

function isUserRootPath(path: string) {
  return path === '/home' || isAuthPath(path);
}

export function NativeBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const accessToken = useAuthStore((state) => state.accessToken);
  const pathRef = useRef(location.pathname);
  const tokenRef = useRef(accessToken);
  pathRef.current = location.pathname;
  tokenRef.current = accessToken;

  useEffect(() => {
    if (navigationType !== 'POP' || !accessToken) return;
    if (isAuthPath(location.pathname)) {
      navigate('/home', { replace: true });
    }
  }, [accessToken, location.pathname, navigate, navigationType]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      const path = pathRef.current;
      const token = tokenRef.current;

      if (isUserRootPath(path)) {
        void CapacitorApp.exitApp();
        return;
      }

      if (canGoBack || getHistoryIndex() > 0) {
        navigate(-1);
        return;
      }

      navigate(token ? '/home' : '/login', { replace: true });
    });

    return () => {
      void Promise.resolve(listener).then((handle) => handle.remove());
    };
  }, [navigate]);

  return null;
}
