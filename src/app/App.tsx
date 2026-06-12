import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Login } from './screens/Login';
import { OTPVerification } from './screens/OTPVerification';
import { UserProfile } from './screens/UserProfile';
import { SymptomSelection } from './screens/SymptomSelection';
import { Questionnaire } from './screens/Questionnaire';
import { AIResults } from './screens/AIResults';
import { DoctorList } from './screens/DoctorList';
import { DoctorProfile } from './screens/DoctorProfile';
import { Consultation } from './screens/Consultation';
import { Home } from './screens/Home';
import { BodyMeasurement } from './screens/BodyMeasurement';
import { MealPlan } from './screens/MealPlan';
import { AppContainer } from './components/AppContainer';
import { useAuthStore } from './store/authStore';
import {DiagnosisResult} from "./screens/DiagnosisResult";
import {QuestionnaireV1} from "./screens/QuestionnaireV1";
import {Consultationv1} from "./screens/Consultationv1";
import PeriodTracker from "./screens/PeriodTracker";
import {Chats} from "./screens/Chats";
import CakeManager from "./screens/CakeManager";
import CakeManagerV1 from "./screens/CakeManagerV1";
import MapPage from "./screens/MapPage";
import FoodExtractor from "./screens/FoodExtractor";
import {MedicalServices} from "./screens/MedicalServices";
import {LabsFlow} from "./screens/LabsFlow";
import { PricingPlans } from './screens/PricingPlans';
import ExerciseExtractor from "./screens/ExerciseExtractor";
import { AdminLogin } from './admin/screens/AdminLogin';
import { AdminLayout } from './admin/layout/AdminLayout';
import { AdminDashboard } from './admin/screens/AdminDashboard';
import { AdminUsers } from './admin/screens/AdminUsers';
import { AdminAppointments } from './admin/screens/AdminAppointments';
import { AdminPayments } from './admin/screens/AdminPayments';
import { AdminChats } from './admin/screens/AdminChats';
import { AdminReports } from './admin/screens/AdminReports';
import { AdminSettingsLayout } from './admin/screens/settings/AdminSettingsLayout';
import { AdminSettingsGeneral } from './admin/screens/settings/AdminSettingsGeneral';
import { AdminSettingsAuth } from './admin/screens/settings/AdminSettingsAuth';
import { AdminSettingsContent } from './admin/screens/settings/AdminSettingsContent';
import { AdminSettingsServices } from './admin/screens/settings/AdminSettingsServices';
import { AdminSettingsAdmins } from './admin/screens/settings/AdminSettingsAdmins';
import { AdminSettingsProfile } from './admin/screens/settings/AdminSettingsProfile';
import { AdminVerifications } from './admin/screens/AdminVerifications';
import { AdminProviders } from './admin/screens/AdminProviders';
import { AdminAiSessions } from './admin/screens/AdminAiSessions';
import { AdminServicesCatalog } from './admin/screens/AdminServicesCatalog';
import { AdminHealthContent } from './admin/screens/AdminHealthContent';
import { AdminSubscriptions } from './admin/screens/AdminSubscriptions';
import { AdminUserDetail } from './admin/screens/details/AdminUserDetail';
import { AdminAppointmentDetail } from './admin/screens/details/AdminAppointmentDetail';
import { AdminChatDetail } from './admin/screens/details/AdminChatDetail';
import { ServiceFlowPlaceholder } from './screens/ServiceFlowPlaceholder';
import { servicesCatalog } from './config/servicesCatalog';
import { useAdminAuthStore } from './admin/store/adminAuthStore';
// import FitnessApp from "./screens/FitnessApp";
// import FitnessAppV1 from "./screens/FitnessAppV1";
// import WorkoutPage from "./screens/WorkoutPage";
// import RestaurantSuggestions from "./screens/RestaurantSuggestions";
// import Entertainment from "./screens/Entertainment";
// import RestaurantMenu from "./screens/RestaurantMenu";
// import MusicPlayer from "./screens/MusicPlayer";
// import WorkoutMusic from "./screens/WorkoutMusic";
// import FoodPage from "./screens/FoodPage";
// import {DoctorCalendar} from "./screens/DoctorCalendar";
// import ChallengesPage from "./screens/ChallengesPage";
// import ChallengeDetailsPage from "./screens/ChallengeDetailsPage";
// import OnboardingPage from "./screens/OnboardingPage";
// import ProfilePage from "./screens/ProfilePage";
// import BodyAnalysisPage from "./screens/BodyAnalysisPage";
// import Forum from "./screens/Forum";
// import ProgressPage from "./screens/ProgressPage";
import MedicalChat from "./screens/MedicalChat";
import MedicalChatV1 from "./screens/MedicalChatV1";
import {DiagnosisResultV1} from "./screens/DiagnosisResultV1";
import MainWorkoutPage from "./screens/MainWorkoutPage";
import {useUserStore} from "./store/useUserStore";

// Protected route wrapper
function ProtectedRoute({ children }) {
    const accessToken = useAuthStore((state) => state.accessToken);

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Protected route with profile verification
function VerifiedRoute({ children }) {
    const accessToken = useAuthStore((state) => state.accessToken);

    const fetchProfile = useUserStore((state) => state.fetchProfile);
    const isVerified = useUserStore((state) => state.isVerified);
    const isLoading = useUserStore((state) => state.isLoading);

    useEffect(() => {
        if (accessToken) {
            fetchProfile();
        }
    }, [accessToken]);

    // اگر توکن ندارد
    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    // loading
    if (isLoading || isVerified === null) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
            </div>
        );
    }

    // اگر وریفای نشده
    if (isVerified === false) {
        return <Navigate to="/profile" replace />;
    }

    return children;
}

// Public route wrapper (redirect to home if already authenticated)
function PublicRoute({ children }) {
    const accessToken = useAuthStore((state) => state.accessToken);

    if (accessToken) {
        return <Navigate to="/home" replace />;
    }

    return children;
}

// Admin auth gate — layout همیشه visible است؛ فقط محتوا اسکلتون می‌شود
function AdminAuthGate() {
    const token = useAdminAuthStore((state) => state.token);
    const logout = useAdminAuthStore((state) => state.logout);
    const [isVerified, setIsVerified] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        fetch('http://185.222.163.113:7000/api/admin/profile', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    logout();
                    return;
                }
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then((data) => {
                if (data) setIsVerified(data.success === true);
            })
            .catch(() => setIsVerified(false))
            .finally(() => setIsLoading(false));
    }, [token, logout]);

    if (!token) return <Navigate to="/admin/login" replace />;
    if (!isLoading && !isVerified) return <Navigate to="/admin/login" replace />;

    return <AdminLayout authLoading={isLoading} />;
}



// Admin public route wrapper (redirect to dashboard if already authenticated)
function AdminPublicRoute({ children }) {
    const token = useAdminAuthStore((state) => state.token);

    if (token) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Redirect root to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Admin routes */}
                <Route
                    path="/admin/login"
                    element={
                        <AdminPublicRoute>
                            <AdminLogin />
                        </AdminPublicRoute>
                    }
                />
                <Route path="/admin" element={<AdminAuthGate />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="users/:id" element={<AdminUserDetail />} />
                    <Route path="verifications" element={<AdminVerifications />} />
                    <Route path="providers" element={<AdminProviders />} />
                    <Route path="appointments" element={<AdminAppointments />} />
                    <Route path="appointments/:id" element={<AdminAppointmentDetail />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="subscriptions" element={<AdminSubscriptions />} />
                    <Route path="chats" element={<AdminChats />} />
                    <Route path="chats/:roomId" element={<AdminChatDetail />} />
                    <Route path="ai-sessions" element={<AdminAiSessions />} />
                    <Route path="services" element={<AdminServicesCatalog />} />
                    <Route path="health-content" element={<AdminHealthContent />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="settings" element={<AdminSettingsLayout />}>
                        <Route path="general" element={<AdminSettingsGeneral />} />
                        <Route path="auth" element={<AdminSettingsAuth />} />
                        <Route path="content" element={<AdminSettingsContent />} />
                        <Route path="services" element={<AdminSettingsServices />} />
                        <Route path="admins" element={<AdminSettingsAdmins />} />
                        <Route path="profile" element={<AdminSettingsProfile />} />
                    </Route>
                </Route>

                <Route
                    path="/chat-test"
                    element={
                        <VerifiedRoute>
                            <AppContainer variant="transparent">
                                <Consultationv1 />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                {/* Public routes */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <AppContainer variant="transparent">
                                <Login />
                            </AppContainer>
                        </PublicRoute>
                    }
                />
                <Route
                    path="/verify"
                    element={
                        <PublicRoute>
                            <AppContainer variant="transparent">
                                <OTPVerification />
                            </AppContainer>
                        </PublicRoute>
                    }
                />

                <Route path="/diagnosis-result" element={<VerifiedRoute>
                    <AppContainer >
                        <DiagnosisResultV1 />
                    </AppContainer></VerifiedRoute>} />

                {/* Protected routes */}
                <Route
                    path="/home"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <Home />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                {/*<Route*/}
                {/*    path="/doctor-calender"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*          /!*<AppContainer showNavbar>*!/*/}
                {/*                <DoctorCalendar />*/}
                {/*            /!*</AppContainer>*!/*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                <Route
                    path="/chats"
                    element={
                        <VerifiedRoute>
                            <AppContainer >
                                <Chats />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/cake"
                    element={
                        <VerifiedRoute>
                            <CakeManager />
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/map"
                    element={
                        <VerifiedRoute>
                            <MapPage />
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/cakev1"
                    element={
                        <VerifiedRoute>
                            <CakeManagerV1 />
                        </VerifiedRoute>
                    }
                />
                {/* صفحه پروفایل فقط با ProtectedRoute (نه VerifiedRoute) */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <AppContainer showNavbar>
                                <UserProfile />
                            </AppContainer>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/plans"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <PricingPlans />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/symptoms"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <SymptomSelection />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/questionnaire"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <Questionnaire />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/questionnairev1"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <QuestionnaireV1 />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/medical-chat"
                    element={
                        <VerifiedRoute>
                            <AppContainer>
                                <MedicalChat />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/medical-chat-v1"
                    element={
                        <VerifiedRoute>
                            <AppContainer>
                                <MedicalChatV1 />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/results"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <AIResults />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/doctors"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <DoctorList />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/period-tracker"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar >
                                <PeriodTracker />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/doctor/:id"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <DoctorProfile />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/consultation/:id"
                    element={
                        <VerifiedRoute>
                            <AppContainer>
                                <Consultationv1 />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/body-measurement"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <BodyMeasurement />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                {/*<Route*/}
                {/*    path="/fit"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <ExerciseExtractor />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                <Route
                    path="/food"
                    element={
                        <VerifiedRoute>
                            <FoodExtractor />
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/services"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <MedicalServices />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/services/labs"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <LabsFlow />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/services/pharmacy"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <ServiceFlowPlaceholder
                                    title={servicesCatalog[1].title}
                                    description={servicesCatalog[1].desc}
                                    icon={servicesCatalog[1].icon}
                                    gradient={servicesCatalog[1].gradient}
                                />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/services/radiology"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <ServiceFlowPlaceholder
                                    title={servicesCatalog[2].title}
                                    description={servicesCatalog[2].desc}
                                    icon={servicesCatalog[2].icon}
                                    gradient={servicesCatalog[2].gradient}
                                />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/services/nurse-home"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <ServiceFlowPlaceholder
                                    title={servicesCatalog[3].title}
                                    description={servicesCatalog[3].desc}
                                    icon={servicesCatalog[3].icon}
                                    gradient={servicesCatalog[3].gradient}
                                />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/meal-plan"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <MealPlan />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                {/*<Route*/}
                {/*    path="/f"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <FitnessApp />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/fit"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <FitnessAppV1 />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/workout"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <WorkoutPage />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/restaurant"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <RestaurantSuggestions />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/entertainment"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            < Entertainment />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/restaurant/:id"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <RestaurantMenu />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/music-player/:id"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <MusicPlayer/>*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/workout-music"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <WorkoutMusic/>*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/plan"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <ExerciseExtractor />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/food"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <FoodExtractor />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/challenges"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <ChallengesPage />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/challenges/:id"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <ChallengeDetailsPage />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/meal"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <FoodPage />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/onboarding"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <OnboardingPage />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/fit-profile"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <ProfilePage />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/progress"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <ProgressPage />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/forum"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <Forum />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/body"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <BodyAnalysisPage />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
                {/*<Route*/}
                {/*    path="/workoutv1"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <MainWorkoutPage />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
