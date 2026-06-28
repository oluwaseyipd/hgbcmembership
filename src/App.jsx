import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Style Sheet
import './index.css';

// Pages
import MembershipForm from './pages/MembershipForm';
import Success from './pages/Success';
import Signin from './pages/Signin';
import Home from './pages/Home'

// Dashboard Pages
import AdminLayout from "./pages/dashboard/AdminLayout";
import Overview from "./pages/dashboard/Overview";
import Members from "./pages/dashboard/Members";

import { API_URL } from "./constants/api";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("hgbc_admin_token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    // Verify token validity with backend
    fetch(`${API_URL}/api/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 200) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("hgbc_admin_token");
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        // If server is unreachable, fall back to offline verification (trust token for now)
        setIsAuthenticated(true);
      });
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/signin" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Registration Page */}
        <Route path="/" element={<Home />} />
        <Route path="/success" element={<Success />} />

        {/* Admin Authentication */}
        <Route path="/signin" element={<Signin />} />

        {/* Dashboard Protected Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="overview" element={<Overview />} />
          <Route path="members" element={<Members />} />
          <Route path="*" element={<Navigate to="/admin/overview" replace />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
