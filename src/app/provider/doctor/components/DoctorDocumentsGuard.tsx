import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useDoctorAuthStore } from '../store/doctorAuthStore';

interface Props {
    children: React.ReactNode;
    role: string;
}

export function DoctorDocumentsGuard({ children, role }: Props) {
    const { doctor, fetchProfile } = useDoctorAuthStore();
    const location = useLocation();

    // همگام‌سازی اطلاعات در صورت لزوم
    useEffect(() => {
        if (!doctor?.document_status) {
            fetchProfile();
        }
    }, []);

    // اگر نقش پزشک نیست، بدون مداخله عبور کند
    if (role !== 'doctor') {
        return <>{children}</>;
    }

    // اگر هنوز آبجکت دکتر لود نشده
    if (!doctor) {
        return null;
    }

    const isDocUploadPath = location.pathname.includes('/documents');
    const isApproved = doctor.document_status === 'approved';

    // اگر تایید شده اما هنوز در صفحه مدارک است، به داشبورد برود
    if (isApproved && isDocUploadPath) {
        return <Navigate to="/provider/doctor/dashboard" replace />;
    }

    // اگر تایید نشده و در مسیری غیر از صفحه مدارک است، به مدارک هدایت شود
    if (!isApproved && !isDocUploadPath) {
        return <Navigate to="/provider/doctor/documents" replace />;
    }

    return <>{children}</>;
}
