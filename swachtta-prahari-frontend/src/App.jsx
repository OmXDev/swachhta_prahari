import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import AuthLayout from "./components/auth/AuthLayout"
import Dashboard from "./components/dashboard/Dashboard"
import DashboardContent from "./components/dashboard/DashboardContent"
import LiveMonitoring from "./components/dashboard/LiveMonitoring"
import Reports from "./components/dashboard/Reports"
import Analytics from "./components/dashboard/Analytics"
import CameraManagement from "./components/dashboard/CameraManagement"
import Settings from "./components/dashboard/Settings"
import Payout from "./components/dashboard/Payout"
import ManagerManagement from "./components/dashboard/ManagerManagement"

function PrivateRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth/*" element={<AuthLayout />} />

            <Route element={<PrivateRoute />}>
              <Route path="/*" element={<Dashboard />}>
                <Route index element={<DashboardContent />} />
                <Route path="monitoring" element={<LiveMonitoring />} />
                <Route path="reports" element={<Reports />} />
                <Route path="analytics" element={<Analytics />} />

                <Route
                  element={<PrivateRoute allowedRoles={["camera", "admin"]} />}
                >
                  <Route path="cameras" element={<CameraManagement />} />
                </Route>

                <Route
                  element={<PrivateRoute allowedRoles={["payroll", "admin"]} />}
                >
                  <Route path="payout" element={<Payout />} />
                </Route>

                <Route
                  element={<PrivateRoute allowedRoles={["admin"]} />}
                >
                  <Route path="manager" element={<ManagerManagement />} />
                </Route>

                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

