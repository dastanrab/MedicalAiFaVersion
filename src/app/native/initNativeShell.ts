import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

export async function initNativeShell(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Light });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    }
  } catch (error) {
    console.warn('StatusBar init failed', error);
  }

  try {
    await SplashScreen.hide();
  } catch (error) {
    console.warn('SplashScreen hide failed', error);
  }
}
