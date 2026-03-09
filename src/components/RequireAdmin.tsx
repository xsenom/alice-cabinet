import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSessionProfile } from "../hooks/useSessionProfile";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
    const { loading, user, profile } = useSessionProfile();
    const location = useLocation();

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    if (!profile?.status_admin) return <Navigate to="/" replace />;

    return <>{children}</>;
}
