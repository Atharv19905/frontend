import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/Home"
import Login from "./pages/Login"
import Analytics from "./pages/Analytics";
// import LoginAdmin from "./pages/LoginAdmin"
// import LoginFaculty from "./pages/LoginFaculty"
import AdminDashboard from "./pages/AdminDashboard"
import FacultyDashboard from "./pages/FacultyDashboard"
import { Toaster } from "react-hot-toast";
import FacultySignup from "./pages/FacultySignup"
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminRequest from "./pages/AdminRequest";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
function App() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (

    <BrowserRouter>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            background: "#1f2937",
            color: "#fff",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <Routes>

        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/admin-login" element={<LoginAdmin />} />
        <Route path="/faculty-login" element={<LoginFaculty />} /> */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/signup" element={<FacultySignup />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/request-admin" element={<AdminRequest />} />
        <Route
          path="/super-admin"
          element={
            user?.role === "super_admin"
              ? <SuperAdminDashboard />
              : <Navigate to="/login" />
          }
        />
      </Routes>

    </BrowserRouter>

  )

}

export default App