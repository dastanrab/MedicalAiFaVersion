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
    const clearToken = useAuthStore((state) => state.logout);
    const accessToken = useAuthStore((state) => state.accessToken);
    const [isVerified, setIsVerified] = useState(null); // null = در حال بررسی
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkProfileVerification = async () => {
            if (!accessToken) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch('http://185.222.163.113:7000/api/user/profile', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        clearToken(); // یا logout() بسته به storesetIsLoading(false);
                        return;
                    }
                    throw new Error('خطا در دریافت اطلاعات');
                }

                const data = await response.json();

                if (data.success) {
                    setIsVerified(data.data.user.is_verify);
                }
            } catch (error) {
                console.error('Error checking profile:', error);
                setIsVerified(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkProfileVerification();
    }, [accessToken]);

    // اگر توکن نداره، به لاگین بفرست
    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    // تا زمانی که در حال بررسی هست، صفحه خالی نشون بده
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
            </div>
        );
    }

    // اگر وریفای نشده، به پروفایل بفرست
    if (isVerified === false) {
        return <Navigate to="/profile" replace />;
    }

    // اگر وریفای شده، صفحه رو نشون بده
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

// Admin protected route wrapper
const AdminProtectedRoute = ({ children }) => {
    const token = useAdminAuthStore((state) => state.token);
    const logout = useAdminAuthStore((state) => state.logout);
    const [isVerified, setIsVerified] = useState(null);
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
    }, [token]);

    if (!token) return <Navigate to="/admin/login" replace />;
    if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" /></div>;
    if (!isVerified) return <Navigate to="/admin/login" replace />;

    return children;
};



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
                <Route
                    path="/admin"
                    element={
                        <AdminProtectedRoute>
                            <AdminLayout />
                        </AdminProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="appointments" element={<AdminAppointments />} />
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
                    <AppContainer showNavbar>
                        <DiagnosisResult />
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
                {/*    path="/meal"*/}
                {/*    element={*/}
                {/*        <VerifiedRoute>*/}
                {/*            <FoodPage />*/}
                {/*        </VerifiedRoute>*/}
                {/*    }*/}
                {/*/>*/}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
