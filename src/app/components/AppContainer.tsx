import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { AppBar } from './AppBar';

interface AppContainerProps {
  children: ReactNode;
  variant?: 'default' | 'transparent';
  showNavbar?: boolean;
  showAppBar?: boolean;
}

export function AppContainer({
  children,
  variant = 'default',
  showNavbar = false,
  showAppBar = false,
}: AppContainerProps) {
  return (
    <div className={variant === 'transparent' ? 'min-h-screen bg-white flex items-center justify-center' : 'min-h-screen bg-gray-100 flex items-center justify-center'}>
      <div className={variant === 'transparent' ? 'w-full max-w-[550px] h-screen bg-white relative overflow-hidden' : 'w-full max-w-[550px] h-screen bg-white shadow-lg relative overflow-hidden'}>
        {showAppBar && <AppBar />}
        {children}
        {showNavbar && <Navbar />}
      </div>
    </div>
  );
}