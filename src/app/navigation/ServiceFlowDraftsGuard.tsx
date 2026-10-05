import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { clearInactiveServiceFlowDrafts } from '../lib/serviceFlowDrafts';

// با هر جابه‌جایی مسیر، پیش‌نویس خدمات درمانی‌ای که کاربر از آن‌ها خارج شده پاک می‌شود
export function ServiceFlowDraftsGuard() {
    const location = useLocation();

    useEffect(() => {
        clearInactiveServiceFlowDrafts(location.pathname, location.state);
    }, [location.pathname, location.state]);

    return null;
}
