import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { Sheet, SheetContent } from './ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { sidebarNavItems } from '../config/navItems';

const SAMPLE_PROFILE = {
  firstName: 'علی',
  lastName: 'محمدی',
  mobile: '09123456789',
  avatarUrl:
    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=128&h=128&fit=crop&crop=face',
  initials: 'عم',
};

interface AppSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppSidebar({ open, onOpenChange }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const displayName = `${SAMPLE_PROFILE.firstName} ${SAMPLE_PROFILE.lastName}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex flex-col w-[300px] sm:max-w-[300px] p-0 border-0 gap-0 overflow-hidden bg-gray-50"
        dir="rtl"
      >
        {/* Profile header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-5 pt-8 pb-6">
          <div
            className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/10"
            aria-hidden
          />
          <div
            className="absolute -bottom-8 -right-6 w-28 h-28 rounded-full bg-white/10"
            aria-hidden
          />

          <div className="relative flex items-center gap-4">
            <Avatar className="size-16 ring-4 ring-white/30 shadow-lg">
              <AvatarImage src={SAMPLE_PROFILE.avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold backdrop-blur-sm">
                {SAMPLE_PROFILE.initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 text-white">
              <p className="text-lg font-bold leading-tight truncate">
                {SAMPLE_PROFILE.firstName}
              </p>
              <p className="text-base font-medium text-white/90 leading-tight truncate">
                {SAMPLE_PROFILE.lastName}
              </p>
              <p className="mt-1 text-sm text-white/80 truncate" dir="ltr">
                {SAMPLE_PROFILE.mobile}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 mb-2 text-xs font-medium text-gray-400 tracking-wide">
            دسترسی سریع
          </p>
          <ul className="space-y-1">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(item.path)}
                    className={`group w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right transition-all duration-200 ${
                      active
                        ? 'bg-white shadow-md shadow-blue-100/80 text-blue-600'
                        : 'text-gray-700 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        active
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500'
                      }`}
                    >
                      <Icon className="size-5" strokeWidth={2} />
                    </span>
                    <span
                      className={`flex-1 text-sm ${
                        active ? 'font-semibold' : 'font-medium'
                      }`}
                    >
                      {item.label}
                    </span>
                    <ChevronLeft
                      className={`size-4 shrink-0 transition-opacity ${
                        active
                          ? 'text-blue-400 opacity-100'
                          : 'text-gray-300 opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer accent */}
        <div className="px-5 py-4 border-t border-gray-200/80 bg-white">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Sparkles className="size-3.5 text-blue-400" />
            <span>هوش مصنوعی سلامت</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
