import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

import VolunteerDashboard from "./pages/VolunteerDashboard";
import OrgDashboard from "./pages/OrgDashboard";

import Opportunities from "./pages/Opportunities";
import ImpactReport from "./pages/ImpactReport";
import Profile from "./pages/Profile";
import MyApplications from "./pages/MyApplications";
import { Toaster } from "react-hot-toast";
import FeedbackPage from "./pages/FeedbackPage";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Role-based Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {user?.role === "organization" ? (
                <OrgDashboard />
              ) : (
                <VolunteerDashboard />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/opportunities"
          element={
            <ProtectedRoute>
              <Opportunities />
            </ProtectedRoute>
          }
        />

        <Route
          path="/impact"
          element={
            <ProtectedRoute>
              <ImpactReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-applications"
          element={
            <ProtectedRoute role="volunteer">
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route path="/feedback/:id" element={<FeedbackPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}