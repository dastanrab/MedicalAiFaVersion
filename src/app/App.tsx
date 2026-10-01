import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Login } from './screens/Login';
import { OTPVerification } from './screens/OTPVerification';
import { UserProfile } from './screens/UserProfile';
import { SymptomSelection } from './screens/SymptomSelection';
import { Questionnaire } from './screens/Questionnaire';
import { DoctorList } from './screens/DoctorList';
import { Home } from './screens/Home';
import { BodyMeasurement } from './screens/BodyMeasurement';
import { MealPlan } from './screens/MealPlan';
import HealthInsights from './screens/HealthInsights';
import { AppContainer } from './components/AppContainer';
import { Spinner } from './components/PageLoader';
import { SplashScreen } from './components/SplashScreen';
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
import { RadiologyFlow } from "./screens/RadiologyFlow";
import { NurseHomeFlow } from "./screens/NurseHomeFlow";
import { PricingPlans } from './screens/PricingPlans';
import { UserFinance } from './screens/UserFinance';
import { CheckoutPage } from './screens/CheckoutPage';
import { PaymentCallbackPage } from './screens/PaymentCallbackPage';
import { PaymentResultPage } from './screens/PaymentResultPage';
import { OrdersPage } from './screens/OrdersPage';
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
import { ProviderRoutes } from './provider/routes/ProviderRoutes';
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
// import HealthPage from "./screens/HealthPage";
// import CoachesPage from "./screens/CoachesPage";
import {PharmacyFlow} from "./screens/PharmacyFlow";
import PartnerJoin from "./screens/PartnerJoin";
import DateInvite from "./screens/DateInvite";
import MusicPage from "./screens/MusicPage";
// import YogaPage from "./screens/YogaPage";
// import YogaCourseDetailPage from "./screens/YogaCourseDetailPage";
// import DashboardHome from "./screens/coach/DashboardHome";
// import ProfessionalDashboard from "./screens/coach/ProfessionalDashboard";
// import StudentsPage from "./screens/coach/StudentsPage";
// import DashboardLayout from "./layouts/DashboardLayout";
// import WorkoutPlansPage from "./screens/coach/WorkoutPlansPage";
// import DietPlansPage from "./screens/coach/DietPlansPage";
// import TasksPage from "./screens/coach/TasksPage";
// import ChatPage from "./screens/coach/ChatPage";
// import DastanTheater from "./screens/DastanTheater";
// import MovieRecommendations from "./screens/MovieRecommendations";
import TourInvitePage from "./screens/TourInvitePage";
import TourLeaderDashboard from "./screens/TourLeaderDashboard";
import {HealthAssessment} from "./screens/HealthAssessment";
// import CoachDetailsPage from "./screens/CoachDetailsPage";
// import CalendarPage from "./screens/coach/CalendarPage";
// import Finances from "./screens/coach/Finances";
// import Analytics from "./screens/coach/Analytics";
// import Settings from "./screens/coach/Settings";
// import {NotificationsNone} from "@mui/icons-material";
// import NotificationTest from "./screens/NotificationTest";
// import ServicesPage from "./screens/ServicesPage";
// import FitServices from "./screens/FitServices";
// import BluetoothTestPage from "./screens/BluetoothTestPage";
// import MyProfilePage from "./screens/MyProfilePage";
// import MyWorkoutPage from "./screens/MyWorkoutPage";
// import FitnessAppV2 from "./screens/FitnessAppV2";
// import LandingPage from "./screens/LandingPage";
// import CourseDetail from "./screens/CourseDetail";
// import ReaderPage from "./screens/ReaderPage";
// import BookStoreUI from "./provider/screens/BookStoreUI";
// import BooksApp from "./screens/BooksApp";
// import BookLibraryUI from "./screens/BookLibraryUI";
// import BookUI from "./screens/BooksUI";
// import ReaderPageV1 from "./screens/ReaderPageV1";
// import ReaderPageV2 from "./screens/ReaderPageV2";
// import PaymentRedirect from "./screens/PaymentRedirect";
// import {DoctorProfileV1} from "./screens/DoctorProfileV1";
import {DoctorProfileV2} from "./screens/DoctorProfileV2";
import {OrdersPageV1} from "./screens/OrdersPageV1";
import {LabsFlowV1} from "./components/LabsFlowV1";
import {Skeleton} from "./components/ui/skeleton";

// ==========================================
// تنظیمات محیط توسعه / سوییچ شروع برنامه
// ==========================================
// اگر مقدار زیر true باشد، صفحه اصلی ('/') به بخش فیتنس ('/fit') هدایت می‌شود.
// اگر مقدار زیر false باشد، روال عادی طی شده و به صفحه لاگین ('/login') می‌رود.
const START_WITH_FITNESS = false;
// ==========================================
import { NativeDeepLinks } from "./native/NativeDeepLinks";

// کامپوننت مدیریت لینک دعوت پارتنر زمانی که کاربر لاگین نیست
function PartnerInviteHandler() {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const accessToken = useAuthStore((state) => state.accessToken);

    useEffect(() => {
        if (code) {
            // ذخیره موقت کد دعوت در localStorage
            localStorage.setItem('pending_partner_invite_code', code);
        }

        if (accessToken) {
            // اگر کاربر از قبل لاگین است، مستقیماً به صفحهٔ عضویت پارتنر برود
            navigate('/partner/join', { replace: true });
        } else {
            // در غیر این صورت به صفحه لاگین هدایت شود
            navigate('/login', { replace: true });
        }
    }, [code, accessToken, navigate]);

    return (
        <div className="flex h-screen items-center justify-center bg-[#F6F8FC]">
            <Spinner />
        </div>
    );
}

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
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
                <Spinner />
            </div>
        );
    }

    // اگر وریفای نشده
    if (isVerified === false) {
        return <Navigate to="/profile" replace />;
    }

    return children;
}

// Public route wrapper (redirect to home or partner join if already authenticated)
function PublicRoute({ children }) {
    const accessToken = useAuthStore((state) => state.accessToken);

    if (accessToken) {
        const pendingInvite = localStorage.getItem('pending_partner_invite_code');
        if (pendingInvite) {
            return <Navigate to="/partner/join" replace />;
        }
        return <Navigate to="/home" replace />;
    }

    return children;
}

// Admin auth gate
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

        fetch('https://api.mediraai.com/api/admin/profile', {
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

// Admin public route wrapper
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
            <SplashScreen/>
            <Skeleton/>
            <NativeDeepLinks />
            <Routes>
                {/*
                    مدیریت هوشمند روت اصلی (Root Route) بر اساس تنظیمات توسعه دهنده
                */}
                <Route
                    path="/"
                    element={<Navigate to={START_WITH_FITNESS ? "/fit" : "/login"} replace />}
                />

                <Route path="/date-invite" element={<DateInvite />} />
                <Route path="/m" element={<MusicPage />} />
                {/* مسیر مدیریت دعوت‌نامه‌ها بدون نیاز به لاگین قبلی */}
                <Route path="/invite/:code" element={<PartnerInviteHandler />} />
                <Route
                    path="/tour-invite/:tourId"
                    element={<TourInvitePage/>}/>
                <Route
                    path="/tour-leader" element={<TourLeaderDashboard/>}/>
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

                {/* Provider panels (mock data — no API) */}
                <Route path="/provider/*" element={<ProviderRoutes />} />

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
                            <AppContainer variant="transparent" forceNavbarOnPhone={false}>
                                <Login />
                            </AppContainer>
                        </PublicRoute>
                    }
                />
                <Route
                    path="/verify"
                    element={
                        <PublicRoute>
                            <AppContainer variant="transparent" forceNavbarOnPhone={false}>
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
                    path="/finance"
                    element={
                        <ProtectedRoute>
                            <AppContainer showNavbar>
                                <UserFinance />
                            </AppContainer>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute>
                            <AppContainer>
                                <CheckoutPage />
                            </AppContainer>
                        </ProtectedRoute>
                    }
                />
                {/* نتیجه پرداخت درگاه؛ بدون لاگین تا در مرورگر بیرونی هم باز شود */}
                <Route path="/payment/result" element={<PaymentResultPage />} />
                <Route
                    path="/payment/callback"
                    element={
                        <ProtectedRoute>
                            <AppContainer>
                                <PaymentCallbackPage />
                            </AppContainer>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <AppContainer showNavbar>
                                <OrdersPageV1 />
                            </AppContainer>
                        </ProtectedRoute>
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
                                {/*<AIResults />*/}
                                <HealthAssessment/>
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
                            <AppContainer showNavbar scrollable size="wide">
                                <DoctorProfileV2 />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/consultation/:id"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar={false}>
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
                                <LabsFlowV1 />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/services/pharmacy"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <PharmacyFlow />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/services/radiology"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <RadiologyFlow />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/services/nurse-home"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <NurseHomeFlow />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />
                <Route
                    path="/partner/join"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <PartnerJoin />
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
                <Route
                    path="/health-insights"
                    element={
                        <VerifiedRoute>
                            <AppContainer showNavbar>
                                <HealthInsights />
                            </AppContainer>
                        </VerifiedRoute>
                    }
                />

                {/* ========================================================= */}
                {/* روت‌های درخواستی - خارج شده از VerifiedRoute و آزاد برای تست */}
                {/* ========================================================= */}

                {/*<Route path="/f" element={<FitnessApp />} />*/}
                {/*<Route path="/start" element={<LandingPage />} />*/}
                {/*<Route path="/fit" element={<FitnessAppV1 />} />*/}
                {/*<Route path="/fit-services" element={<FitServices />} />*/}
                {/*<Route path="/workout" element={<WorkoutPage />} />*/}
                {/*<Route path="/my-workout" element={<MyWorkoutPage />} />*/}
                {/*<Route path="/my-profile" element={<MyProfilePage />} />*/}
                {/*<Route path="/restaurant" element={<RestaurantSuggestions />} />*/}
                {/*<Route path="/entertainment" element={<Entertainment />} />*/}
                {/*<Route path="/restaurant/:id" element={<RestaurantMenu />} />*/}
                {/*<Route path="/music-player/:id" element={<MusicPlayer />} />*/}
                {/*<Route path="/workout-music" element={<WorkoutMusic />} />*/}
                {/*<Route path="/plan" element={<ExerciseExtractor />} />*/}
                {/*<Route path="/coaches" element={<CoachesPage />} />*/}
                {/*<Route path="/coaches/:id" element={<CoachDetailsPage />} />*/}
                {/*<Route path="/challenges" element={<ChallengesPage />} />*/}
                {/*<Route path="/challenges/:id" element={<ChallengeDetailsPage />} />*/}
                {/*<Route path="/meal" element={<FoodPage />} />*/}
                {/*<Route path="/bt" element={<BluetoothTestPage />} />*/}
                {/*<Route path="/onboarding" element={<OnboardingPage />} />*/}
                {/*<Route path="/fit-profile" element={<ProfilePage />} />*/}
                {/*<Route path="/progress" element={<ProgressPage />} />*/}
                {/*<Route path="/forum" element={<Forum />} />*/}
                {/*<Route path="/body" element={<BodyAnalysisPage />} />*/}
                {/*<Route path="/workoutv1" element={<MainWorkoutPage />} />*/}
                {/*<Route path="/course/:id" element={<YogaCourseDetailPage />} />*/}
                {/*<Route path="/yoga-course" element={<CourseDetail />} />*/}

                {/*<Route path="/suprise" element={*/}
                {/*    // <DastanTheater />*/}
                {/*    <MovieRecommendations />*/}
                {/*} />*/}

                {/*<Route path="/yoga" element={<YogaPage />} />*/}
                {/*<Route path="/fit-health" element={<HealthPage />} />*/}

                {/*/!* روت‌های مرتبط با داشبورد مربی (همچنان داخل Layout خودشان هستند) *!/*/}
                {/*<Route path="/coach/dashboard" element={*/}
                {/*    <DashboardLayout>*/}
                {/*        <ProfessionalDashboard />*/}
                {/*    </DashboardLayout>*/}
                {/*} />*/}
                {/*<Route path="/coach/calendar" element={*/}
                {/*    <DashboardLayout>*/}
                {/*        <CalendarPage />*/}
                {/*    </DashboardLayout>*/}
                {/*} />*/}
                {/*<Route path="/coach/finances" element={*/}
                {/*    <DashboardLayout>*/}
                {/*        <Finances />*/}
                {/*    </DashboardLayout>*/}
                {/*} />*/}
                {/*<Route path="/coach/analytics" element={*/}
                {/*    <DashboardLayout>*/}
                {/*        <Analytics />*/}
                {/*    </DashboardLayout>*/}
                {/*} />*/}
                {/*<Route path="/coach/settings" element={*/}
                {/*    <DashboardLayout>*/}
                {/*        <Settings />*/}
                {/*    </DashboardLayout>*/}
                {/*} />*/}

                {/*<Route path="/notif" element={<NotificationTest />} />*/}

                {/*<Route path="/coach/workout-plans" element={*/}
                {/*    <DashboardLayout>*/}
                {/*        <WorkoutPlansPage />*/}
                {/*    </DashboardLayout>*/}
                {/*} />*/}
                {/*<Route path="/coach/diet-plans" element={*/}
                {/*    <DashboardLayout>*/}
                {/*        <DietPlansPage />*/}
                {/*    </DashboardLayout>*/}
                {/*} />*/}
                {/*<Route path="/coach/tasks" element={*/}
                {/*    <DashboardLayout>*/}
                {/*        <TasksPage />*/}
                {/*    </DashboardLayout>*/}
                {/*} />*/}
                {/*<Route path="/coach/chat" element={*/}
                {/*    <DashboardLayout>*/}
                {/*        <ChatPage />*/}
                {/*    </DashboardLayout>*/}
                {/*} />*/}
                {/*<Route path="/book" element={*/}
                {/*    <ReaderPage/>*/}
                {/*} />*/}
                {/*<Route path="/bookV1" element={*/}
                {/*   <ReaderPageV2/>*/}
                {/*} />*/}
                {/*<Route path="/pg" element={*/}
                {/*    <PaymentRedirect/>*/}
                {/*} />*/}
                {/*<Route path="/payment/result" element={<PaymentResultPage />} />*/}


                {/*/!* ========================================================= *!/*/}
                {/*/!* پایان روت‌های درخواستی *!/*/}
                {/*/!* ========================================================= *!/*/}

            </Routes>
        </BrowserRouter>
    );
}

export default App;
