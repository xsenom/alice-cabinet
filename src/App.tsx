import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/LibraryPage";
import AssistantPage from "./pages/AssistantPage";
import ProfilePage from "./pages/ProfilePage";
import BottomTabs from "./components/BottomTabs";
import NetworkCanvasBackground from "./components/NetworkCanvasBackground";

export const TOKENS = {
    bg0: "#06110D",
    bg1: "#071A12",
    panel0: "#0D241A",
    panel1: "#102A20",
    neon: "#61FF8A",
    constellation: "#B7A85E",
    text: "#F2F4F3", 
    muted: "#A9B3AE",
};

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="min-h-screen"
            style={{
                background: `radial-gradient(1200px 900px at 50% 0%, ${TOKENS.bg1} 0%, ${TOKENS.bg0} 55%, #040B08 100%)`,
                color: TOKENS.text,
            }}
        >
            <NetworkCanvasBackground density={56} />
            <div className="mx-auto w-full max-w-md px-4 pt-5 pb-24">{children}</div>
            <BottomTabs />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/library" element={<LibraryPage />} />
                    <Route path="/assistant" element={<AssistantPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}
