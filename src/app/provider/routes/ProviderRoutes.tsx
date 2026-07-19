import { Navigate, Route, Routes, useParams } from 'react-router';
import { ProviderLayoutShell } from '../layout/ProviderLayout';
import { ProviderToaster } from '../components/ProviderToaster';
import type { ProviderRole } from '../config/providerNav';
import { providerPath } from '../config/providerNav';
import { LabDashboard } from '../screens/lab/LabDashboard';
import {LabRequestsPage, LabRequestsPagee} from '../screens/lab/LabRequestsPage';
import { LabCatalogPage } from '../screens/lab/LabCatalogPage';
import { LabSchedulePage } from '../screens/lab/LabSchedulePage';
import { LabHomeSamplingPage } from '../screens/lab/LabHomeSamplingPage';
import { LabResultsPage } from '../screens/lab/LabResultsPage';
import { PharmacyDashboard } from '../screens/pharmacy/PharmacyDashboard';
import { PharmacyRequestsPage, PharmacyRequestDetailPage } from '../screens/pharmacy/PharmacyRequestsPage';
import { PharmacyInventoryPage } from '../screens/pharmacy/PharmacyInventoryPage';
import { PharmacyDeliveryPage } from '../screens/pharmacy/PharmacyDeliveryPage';
import { PharmacyMapPage } from '../screens/pharmacy/PharmacyMapPage';
import { NurseDashboard } from '../screens/nurse/NurseDashboard';
import { NurseRequestsPage, NurseRequestDetailPage } from '../screens/nurse/NurseRequestsPage';
import { NurseCalendarPage } from '../screens/nurse/NurseCalendarPage';
import { NurseSchedulePage } from '../screens/nurse/NurseSchedulePage';
import { NursePersonnelPage } from '../screens/nurse/NursePersonnelPage';
import { NurseServicesPage } from '../screens/nurse/NurseServicesPage';
import { NurseRoleGate } from '../components/NurseRoleGate';
import { ProviderFinancePage } from '../screens/shared/ProviderFinancePage';
import { ProviderReviewsPage } from '../screens/shared/ProviderReviewsPage';
import { ProviderSettingsPage } from '../screens/shared/ProviderSettingsPage';
import { ProviderSupportPage } from '../screens/shared/ProviderSupportPage';
import {
    ProviderLogin,
    ProviderAuthGate,
    ProviderPublicRoute,
} from '../screens/ProviderLogin';
import {LabRequestDetailPage} from "../screens/lab/LabRequestDetailPage";
import {
    DoctorLoginPage,
    DoctorAuthGate,
    DoctorPublicRoute,
} from '../doctor/screens/DoctorLoginPage';
import { DoctorDashboardPage } from '../doctor/screens/DoctorDashboardPage';
import { DoctorAppointmentsPage } from '../doctor/screens/DoctorAppointmentsPage';
import  DoctorAppointmentDetailPage  from '../doctor/screens/DoctorAppointmentDetailPage';
import { DoctorPatientsPage } from '../doctor/screens/DoctorPatientsPage';
import { DoctorPatientDetailPage } from '../doctor/screens/DoctorPatientDetailPage';
import { DoctorSchedulePage } from '../doctor/screens/DoctorSchedulePage';
import { DoctorConsultationsPage } from '../doctor/screens/DoctorConsultationsPage';
import { DoctorPrescriptionsPage } from '../doctor/screens/DoctorPrescriptionsPage';
import { DoctorFinancePage } from '../doctor/screens/DoctorFinancePage';
import { DoctorReviewsPage } from '../doctor/screens/DoctorReviewsPage';
import { DoctorSettingsPage } from '../doctor/screens/DoctorSettingsPage';
import NurseCoveragePage from "../screens/nurse/NurseCoveragePage";
import {DoctorChatPage} from "../doctor/screens/DoctorChatPage";

function LabRequestDetailRoute() {
    const { id } = useParams();
    return <LabRequestDetailPage requestId={Number(id)} />;
}

function PharmacyRequestDetailRoute() {
    const { id } = useParams();
    return <PharmacyRequestDetailPage requestId={Number(id)} />;
}

function NurseRequestDetailRoute() {
    const { id } = useParams();
    return <NurseRequestDetailPage requestId={Number(id)} />;
}

function DoctorAppointmentDetailRoute() {
    const { id } = useParams();
    return <DoctorAppointmentDetailPage appointmentId={Number(id)} />;
}

function DoctorPatientDetailRoute() {
    const { id } = useParams();
    return <DoctorPatientDetailPage patientId={Number(id)} />;
}

function SharedFinance({ role }: { role: ProviderRole }) {
    return <ProviderFinancePage role={role} />;
}

function SharedSettings({ role }: { role: ProviderRole }) {
    return <ProviderSettingsPage role={role} />;
}

function RoleRoutes({ role }: { role: ProviderRole }) {
    if (role === 'lab') {
        return (
            <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<LabDashboard />} />
                <Route path="requests" element={<LabRequestsPage />} />
                <Route path="requests/:id" element={<LabRequestDetailRoute />} />
                <Route path="catalog" element={<LabCatalogPage />} />
                <Route path="schedule" element={<LabSchedulePage />} />
                <Route path="home-sampling" element={<LabHomeSamplingPage />} />
                <Route path="results" element={<LabResultsPage />} />
                <Route path="finance" element={<SharedFinance role="lab" />} />
                <Route path="reviews" element={<ProviderReviewsPage />} />
                <Route path="settings" element={<SharedSettings role="lab" />} />
                <Route path="support" element={<ProviderSupportPage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
        );
    }

    if (role === 'pharmacy') {
        return (
            <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<PharmacyDashboard />} />
                <Route path="requests" element={<PharmacyRequestsPage />} />
                <Route path="requests/:id" element={<PharmacyRequestDetailRoute />} />
                <Route path="inventory" element={<PharmacyInventoryPage />} />
                <Route path="delivery" element={<PharmacyDeliveryPage />} />
                <Route path="map" element={<PharmacyMapPage />} />
                <Route path="finance" element={<SharedFinance role="pharmacy" />} />
                <Route path="reviews" element={<ProviderReviewsPage />} />
                <Route path="settings" element={<SharedSettings role="pharmacy" />} />
                <Route path="support" element={<ProviderSupportPage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
        );
    }

    if (role === 'doctor') {
        return (
            <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DoctorDashboardPage />} />
                <Route path="appointments" element={<DoctorAppointmentsPage />} />
                <Route path="appointments/:id" element={<DoctorAppointmentDetailRoute />} />
                <Route path="patients" element={<DoctorPatientsPage />} />
                <Route path="patients/:id" element={<DoctorPatientDetailRoute />} />
                <Route path="schedule" element={<DoctorSchedulePage />} />
                <Route path="consultations" element={<DoctorConsultationsPage />} />
                <Route path="/consultations/:id" element={<DoctorChatPage />} />
                <Route path="prescriptions" element={<DoctorPrescriptionsPage />} />
                <Route path="finance" element={<DoctorFinancePage />} />
                <Route path="reviews" element={<DoctorReviewsPage />} />
                <Route path="settings" element={<DoctorSettingsPage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<NurseDashboard />} />
            <Route path="calendar" element={<NurseCalendarPage />} />
            <Route path="requests" element={<NurseRequestsPage />} />
            <Route path="requests/:id" element={<NurseRequestDetailRoute />} />
            <Route path="schedule" element={<NurseSchedulePage />} />
            <Route path="coverage" element={<NurseCoveragePage />} />
            <Route path="personnel" element={<NurseRoleGate allowed={['company']}><NursePersonnelPage /></NurseRoleGate>} />
            <Route path="services" element={<NurseRoleGate allowed={['company']}><NurseServicesPage /></NurseRoleGate>} />
            <Route path="finance" element={<SharedFinance role="nurse" />} />
            <Route path="reviews" element={<ProviderReviewsPage />} />
            <Route path="settings" element={<SharedSettings role="nurse" />} />
            <Route path="support" element={<ProviderSupportPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
    );
}

function ProviderRoleLayout({ role }: { role: ProviderRole }) {
    return (
        <ProviderLayoutShell role={role}>
            <RoleRoutes role={role} />
        </ProviderLayoutShell>
    );
}

function ProtectedRolePanel({ role }: { role: ProviderRole }) {
    if (role === 'doctor') {
        return (
            <DoctorAuthGate>
                <ProviderRoleLayout role={role} />
            </DoctorAuthGate>
        );
    }

    return (
        <ProviderAuthGate role={role}>
            <ProviderRoleLayout role={role} />
        </ProviderAuthGate>
    );
}

export function ProviderRoutes() {
    return (
        <>
            <ProviderToaster />
            <Routes>
                <Route
                    path="lab/login"
                    element={
                        <ProviderPublicRoute role="lab">
                            <ProviderLogin role="lab" />
                        </ProviderPublicRoute>
                    }
                />
                <Route path="lab/*" element={<ProtectedRolePanel role="lab" />} />

                <Route
                    path="pharmacy/login"
                    element={
                        <ProviderPublicRoute role="pharmacy">
                            <ProviderLogin role="pharmacy" />
                        </ProviderPublicRoute>
                    }
                />
                <Route path="pharmacy/*" element={<ProtectedRolePanel role="pharmacy" />} />

                <Route
                    path="nurse/login"
                    element={
                        <ProviderPublicRoute role="nurse">
                            <ProviderLogin role="nurse" />
                        </ProviderPublicRoute>
                    }
                />
                <Route path="nurse/*" element={<ProtectedRolePanel role="nurse" />} />

                <Route
                    path="doctor/login"
                    element={
                        <DoctorPublicRoute>
                            <DoctorLoginPage />
                        </DoctorPublicRoute>
                    }
                />
                <Route path="doctor/*" element={<ProtectedRolePanel role="doctor" />} />

                <Route index element={<Navigate to={providerPath('lab', 'login')} replace />} />
            </Routes>
        </>
    );
}
