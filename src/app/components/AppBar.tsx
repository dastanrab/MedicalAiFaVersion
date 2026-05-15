import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Menu } from 'lucide-react';
import { Chat } from '@mui/icons-material';
import { AppSidebar } from './AppSidebar';

export function AppBar() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white">
        <div className="flex w-full items-center px-6 py-4" dir="ltr">
          <button
            type="button"
            onClick={() => navigate('/chats')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="پیام‌ها"
          >
            <Chat className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="ms-auto flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="منو"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AppSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </>
  );
}
