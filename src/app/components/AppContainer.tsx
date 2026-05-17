import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { AppBar } from './AppBar';

interface AppContainerProps {
  children: ReactNode;
  variant?: 'default' | 'transparent';
  showNavbar?: boolean;
  showAppBar?: boolean;
}

const phoneFrameClass =
  'relative flex h-screen w-full max-w-[550px] flex-col overflow-hidden bg-white';

export function AppContainer({
  children,
  variant = 'default',
  showNavbar = false,
  showAppBar = false,
}: AppContainerProps) {
  const outerClass =
    variant === 'transparent'
      ? 'flex min-h-screen items-center justify-center bg-white'
      : 'flex min-h-screen items-center justify-center bg-gray-100';

  const frameClass =
    variant === 'transparent' ? phoneFrameClass : `${phoneFrameClass} shadow-lg`;

  return (
    <div className={outerClass}>
      <div className={frameClass}>
        {showAppBar && <AppBar />}
        <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
        {showNavbar && <Navbar />}
      </div>
    </div>
  );
}
