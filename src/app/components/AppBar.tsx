import { useNavigate } from 'react-router';
import { ArrowLeft, Menu, Crown, LogOut  } from 'lucide-react';
import {useAuthStore} from "../store/authStore";
import {Chat} from "@mui/icons-material";


interface AppBarProps {
  title: string;
  onMenuClick?: () => void;
  showPricingIcon?: boolean;
  onPricingClick?: () => void;
  showLogout?: boolean;
  showChat?: boolean;
}

export function AppBar({ title, onMenuClick, showPricingIcon = false, onPricingClick, showLogout = false, showChat = false }: AppBarProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  return (
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          {showChat ? (<button
              onClick={() => navigate('/chats')}
              className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Chat className="w-5 h-5" />
          </button>) : (<button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>)}


          <h1 className="text-lg text-gray-900 absolute left-1/2 transform -translate-x-1/2">
            {title}
          </h1>

          {showLogout ? (
              <button
                  onClick={logout}
                  className="flex items-center justify-center w-10 h-10 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
          ) : showPricingIcon ? (
              <button
                  onClick={onPricingClick}
                  className="flex items-center justify-center w-10 h-10 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
              >
                <Crown className="w-5 h-5" />
              </button>
          ) : (
              <button
                  onClick={onMenuClick}
                  className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
          )}
        </div>
      </div>
  );
}
