import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./HomePage";
import LibraryPage from "./LibraryPage";
import AssistantPage from "./AssistantPage";
import ProfilePage from "./ProfilePage";

export default function AppTabsPage() {
    return (
        <Routes>
            <Route index element={<HomePage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
    );
}
