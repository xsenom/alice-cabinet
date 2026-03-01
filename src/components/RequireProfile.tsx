import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSessionProfile } from "../hooks/useSessionProfile";

type Props = {
    children: ReactNode;
};

export default function RequireProfile({ children }: Props) {
    const { loading, user, profile } = useSessionProfile();

    if (loading) return null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const isProfileFilled =
        !!profile?.full_name && !!profile?.profession;

    if (!isProfileFilled) {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
}