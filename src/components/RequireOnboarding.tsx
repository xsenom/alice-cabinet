import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSessionProfile } from "../hooks/useSessionProfile";

export default function RequireOnboarding({ children }: { children: React.ReactNode }) {
    const { loading, user, profile } = useSessionProfile();
    const nav = useNavigate();
    const loc = useLocation();

    const completed = !!(profile?.full_name?.trim() && profile?.profession?.trim());
    const isOnboardingRoute = loc.pathname === "/profile" && new URLSearchParams(loc.search).get("onboarding") === "1";

    useEffect(() => {
        if (loading) return;

        // если не залогинен — редирект на /login (если у тебя другой guard, убери это)
        if (!user) {
            nav("/login", { replace: true });
            return;
        }

        // если не заполнен — всегда гоним в onboarding
        if (!completed && !isOnboardingRoute) {
            nav("/profile?onboarding=1", { replace: true });
        }

        // если заполнен, но пользователь почему-то сидит на onboarding url — отправим в норм профиль
        if (completed && isOnboardingRoute) {
            nav("/profile", { replace: true });
        }
    }, [loading, user, completed, isOnboardingRoute, nav]);

    if (loading) return null;

    // пока редиректим — не рисуем ничего, чтобы не было морганий
    if (user && !completed && !isOnboardingRoute) return null;

    return <>{children}</>;
}
