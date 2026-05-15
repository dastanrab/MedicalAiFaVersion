import { useNavigate, useLocation } from 'react-router';
import { mainNavItems } from '../config/navItems';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className="
        absolute
        bottom-0 left-0 right-0
        bg-white
        border-t border-gray-200
        px-4 py-3
        z-50
      "
    >
      <div className="flex items-center justify-around">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 min-w-0 flex-1 transition-all"
            >
              <div
                className={`p-2 rounded-xl transition-all ${
                  active
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <span
                className={`text-xs transition-colors ${
                  active ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
