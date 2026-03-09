import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import RequireOnboarding from "./components/RequireOnboarding";
import RequireAdmin from "./components/RequireAdmin";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/LibraryPage";
import AssistantPage from "./pages/AssistantPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset" element={<ResetPasswordPage />} />

            <Route path="/" element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route
                    element={
                        <RequireOnboarding>
                            <Outlet />
                        </RequireOnboarding>
                    }
                >
                    <Route path="library" element={<LibraryPage />} />
                    <Route path="assistant" element={<AssistantPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route
                        path="admin"
                        element={
                            <RequireAdmin>
                                <AdminPage />
                            </RequireAdmin>
                        }
                    />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
