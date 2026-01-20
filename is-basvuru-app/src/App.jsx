import "./App.css";
import { Routes, Route } from "react-router-dom";
import JobApplicationForm from "./components/Users/JobApplicationForm";
import AdminLayout from "./components/Layouts/AdminLayout/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Admin/Login/Login";
import AdminPanel from "./components/Admin/Panel/AdminPanel";
import Logs from "./components/Admin/Logs/ApplicationLogs";
import UserLogs from "./components/Admin/Logs/UserLogs";

function App() {
  return (
    <>
      <Routes>
        {/* User */}
        <Route path="/" element={<JobApplicationForm />}></Route>

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin (korumalı) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="panel" element={<AdminPanel />} />
            <Route path="logs" element={<Logs />} />
            <Route path="user-logs" element={<UserLogs />} />
          </Route>
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
