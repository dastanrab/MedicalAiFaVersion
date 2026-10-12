import { Navigate, Route, Routes } from 'react-router';
import type { ReactNode } from 'react';
import type { ProviderRole } from '../../config/providerNav';
import { ProviderLayoutShell } from '../../layout/ProviderLayout';
import { StaffAuthGate, StaffPermissionGate, StaffPublicRoute } from '../components/StaffGates';
import { staffPath, type StaffPermission } from '../config/staffPermissions';
import { StaffLoginPage } from '../screens/StaffLoginPage';
import { StaffDashboardPage } from '../screens/StaffDashboardPage';
import { StaffReviewsPage } from '../screens/StaffReviewsPage';
import { StaffAppointmentsPage } from '../screens/doctor/StaffAppointmentsPage';
import { StaffPatientsPage } from '../screens/doctor/StaffPatientsPage';
import { StaffSchedulePage } from '../screens/doctor/StaffSchedulePage';
import { StaffLabRequestsPage } from '../screens/lab/StaffLabRequestsPage';
import { StaffLabSchedulePage } from '../screens/lab/StaffLabSchedulePage';
import { StaffLabResultsPage } from '../screens/lab/StaffLabResultsPage';
import { StaffPharmacyRequestsPage } from '../screens/pharmacy/StaffPharmacyRequestsPage';
import { StaffInventoryPage } from '../screens/pharmacy/StaffInventoryPage';
import { StaffDeliveryPage } from '../screens/pharmacy/StaffDeliveryPage';
import { StaffNurseRequestsPage } from '../screens/nurse/StaffNurseRequestsPage';
import { StaffPersonnelPage, StaffServicesPage } from '../screens/nurse/StaffNurseCatalogPages';

interface StaffPageDef {
    segment: string;
    permission: StaffPermission;
    element: ReactNode;
}

const rolePages: Record<ProviderRole, StaffPageDef[]> = {
    doctor: [
        { segment: 'appointments', permission: 'appointments.view', element: <StaffAppointmentsPage /> },
        { segment: 'patients', permission: 'patients.contact', element: <StaffPatientsPage /> },
        { segment: 'schedule', permission: 'schedule.view', element: <StaffSchedulePage /> },
    ],
    lab: [
        { segment: 'requests', permission: 'lab.requests.view', element: <StaffLabRequestsPage /> },
        { segment: 'schedule', permission: 'lab.schedule.view', element: <StaffLabSchedulePage /> },
        { segment: 'results', permission: 'lab.results.upload', element: <StaffLabResultsPage /> },
    ],
    pharmacy: [
        { segment: 'requests', permission: 'pharmacy.requests.view', element: <StaffPharmacyRequestsPage /> },
        { segment: 'inventory', permission: 'pharmacy.inventory.view', element: <StaffInventoryPage /> },
        { segment: 'delivery', permission: 'pharmacy.delivery.manage', element: <StaffDeliveryPage /> },
    ],
    nurse: [
        { segment: 'requests', permission: 'nurse.requests.view', element: <StaffNurseRequestsPage /> },
        { segment: 'personnel', permission: 'nurse.personnel.view', element: <StaffPersonnelPage /> },
        { segment: 'services', permission: 'nurse.services.view', element: <StaffServicesPage /> },
    ],
};

function StaffPanel({ role }: { role: ProviderRole }) {
    const pages: StaffPageDef[] = [
        { segment: 'dashboard', permission: 'dashboard.view', element: <StaffDashboardPage role={role} /> },
        ...rolePages[role],
        { segment: 'reviews', permission: 'reviews.view', element: <StaffReviewsPage /> },
    ];

    return (
        <StaffAuthGate role={role}>
            <ProviderLayoutShell role={role} mode="staff">
                <Routes>
                    <Route index element={<Navigate to={staffPath(role, 'dashboard')} replace />} />
                    {pages.map((p) => (
                        <Route
                            key={p.segment}
                            path={p.segment}
                            element={
                                <StaffPermissionGate role={role} permission={p.permission}>
                                    {p.element}
                                </StaffPermissionGate>
                            }
                        />
                    ))}
                    {/* مالی، پلن، VIP، تنظیمات و هر مسیر دیگری برای کارمند وجود ندارد */}
                    <Route path="*" element={<Navigate to={staffPath(role, 'dashboard')} replace />} />
                </Routes>
            </ProviderLayoutShell>
        </StaffAuthGate>
    );
}

/** مسیرهای /provider/:role/staff/* — ورود و پنل کارمند */
export function StaffRoutes({ role }: { role: ProviderRole }) {
    return (
        <Routes>
            <Route
                path="login"
                element={
                    <StaffPublicRoute role={role}>
                        <StaffLoginPage role={role} />
                    </StaffPublicRoute>
                }
            />
            <Route path="*" element={<StaffPanel role={role} />} />
        </Routes>
    );
}
