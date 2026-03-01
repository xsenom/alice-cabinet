import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import RequireOnboarding from "./components/RequireOnboarding";

import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/LibraryPage";
import AssistantPage from "./pages/AssistantPage";
import ProfilePage from "./pages/ProfilePage";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset" element={<ResetPasswordPage />} />

            <Route
                path="/"
                element={
                    <RequireOnboarding>
                        <AppLayout />
                    </RequireOnboarding>
                }
            >
                <Route index element={<HomePage />} />
                <Route path="library" element={<LibraryPage />} />
                <Route path="assistant" element={<AssistantPage />} />
                <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
