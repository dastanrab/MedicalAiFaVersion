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
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="w-full px-6 py-4 flex items-center" dir="ltr">
          <button
            type="button"
            onClick={() => navigate('/chats')}
            className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="پیام‌ها"
          >
            <Chat className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="ms-auto flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="منو"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AppSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </>
  );
}
