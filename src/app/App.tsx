import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
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
import {LabsFlow} from "./screens/LabsFlow"; // adjust path to your store
import { PricingPlans } from './screens/PricingPlans';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
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

function App() {
  return (
      <BrowserRouter>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

            <Route
                path="/chat-test"
                element={
                    <ProtectedRoute>
                        <AppContainer variant="transparent">
                            <Consultationv1 />
                        </AppContainer>
                    </ProtectedRoute>
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

            <Route path="/diagnosis-result" element={<ProtectedRoute>
                <AppContainer showNavbar>
                    <DiagnosisResult />
                </AppContainer></ProtectedRoute>} />

            {/* Protected routes */}
          <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <AppContainer showNavbar>
                    <Home />
                  </AppContainer>
                </ProtectedRoute>
              }
          />
            <Route
                path="/chats"
                element={
                    <ProtectedRoute>
                        <AppContainer >
                            <Chats />
                        </AppContainer>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/cake"
                element={
                    <ProtectedRoute>
                            <CakeManager />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/map"
                element={
                    <ProtectedRoute>
                        <MapPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/cakev1"
                element={
                    <ProtectedRoute>
                        <CakeManagerV1 />
                    </ProtectedRoute>
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
                <ProtectedRoute>
                  <AppContainer showNavbar>
                    <PricingPlans />
                  </AppContainer>
                </ProtectedRoute>
              }
          />
          <Route
              path="/symptoms"
              element={
                <ProtectedRoute>
                  <AppContainer showNavbar>
                    <SymptomSelection />
                  </AppContainer>
                </ProtectedRoute>
              }
          />
          <Route
              path="/questionnaire"
              element={
                <ProtectedRoute>
                  <AppContainer showNavbar>
                    <Questionnaire />
                  </AppContainer>
                </ProtectedRoute>
              }
          />
            <Route
                path="/questionnairev1"
                element={
                    <ProtectedRoute>
                        <AppContainer showNavbar>
                            <QuestionnaireV1 />
                        </AppContainer>
                    </ProtectedRoute>
                }
            />
          <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <AppContainer showNavbar>
                    <AIResults />
                  </AppContainer>
                </ProtectedRoute>
              }
          />
          <Route
              path="/doctors"
              element={
                <ProtectedRoute>
                  <AppContainer showNavbar>
                    <DoctorList />
                  </AppContainer>
                </ProtectedRoute>
              }
          />
            <Route
                path="/period-tracker"
                element={
                    <ProtectedRoute>
                        <AppContainer showNavbar >
                            <PeriodTracker />
                        </AppContainer>
                    </ProtectedRoute>
                }
            />
          <Route
              path="/doctor/:id"
              element={
                <ProtectedRoute>
                  <AppContainer showNavbar>
                    <DoctorProfile />
                  </AppContainer>
                </ProtectedRoute>
              }
          />
          <Route
              path="/consultation/:id"
              element={
                <ProtectedRoute>
                  <AppContainer>
                    <Consultationv1 />
                  </AppContainer>
                </ProtectedRoute>
              }
          />
          <Route
              path="/body-measurement"
              element={
                <ProtectedRoute>
                  <AppContainer showNavbar>
                    <BodyMeasurement />
                  </AppContainer>
                </ProtectedRoute>
              }
          />
            <Route
                path="/food"
                element={
                    <ProtectedRoute>
                            <FoodExtractor />

                    </ProtectedRoute>
                }
            />
            <Route
                path="/services"
                element={
                    <ProtectedRoute>
                        <AppContainer showNavbar>
                            <MedicalServices />
                        </AppContainer>


                    </ProtectedRoute>
                }
            />
            <Route
                path="/services/labs"
                element={
                    <ProtectedRoute>
                        <AppContainer showNavbar>
                            <LabsFlow />
                        </AppContainer>


                    </ProtectedRoute>
                }
            />
          <Route
              path="/meal-plan"
              element={
                <ProtectedRoute>
                  <AppContainer showNavbar>
                    <MealPlan />
                  </AppContainer>
                </ProtectedRoute>
              }
          />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
