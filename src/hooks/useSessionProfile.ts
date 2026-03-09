import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase/client";

/* =========================
   Types
========================= */

export type SessionUser = {
    id: string;
    email: string | null;
};

export type CabinetProfile = {
    id: string;
    email: string | null;
    original_email: string | null;
    full_name: string | null;
    profession: string | null;
    avatar_url: string | null;
    plan_status: "free" | "paid_1m" | "paid_3m";
    plan_expires_at: string | null;
    created_at?: string;
    updated_at?: string;
};

type State = {
    loading: boolean;
    user: SessionUser | null;
    profile: CabinetProfile | null;
    error: string | null;
    refresh: () => Promise<void>;
};

type CacheState = {
    user: SessionUser | null;
    profile: CabinetProfile | null;
    error: string | null;
};

let cacheState: CacheState = {
    user: null,
    profile: null,
    error: null,
};

/* =========================
   Hook
========================= */

export function useSessionProfile(): State {
    const [loading, setLoading] = useState(!cacheState.user && !cacheState.profile);
    const [user, setUser] = useState<SessionUser | null>(cacheState.user);
    const [profile, setProfile] = useState<CabinetProfile | null>(cacheState.profile);
    const [error, setError] = useState<string | null>(cacheState.error);

    // защита от двойного вызова в StrictMode
    const inFlight = useRef<Promise<void> | null>(null);

    const load = async (): Promise<void> => {
        if (inFlight.current) return inFlight.current;

        const promise = (async () => {
            if (!cacheState.profile) setLoading(true);
            setError(null);

            // 1️⃣ Получаем пользователя
            const { data: userData, error: userErr } =
                await supabase.auth.getUser();

            if (userErr) {
                setUser(null);
                setProfile(null);
                setError(userErr.message);
                cacheState = { user: null, profile: null, error: userErr.message };
                setLoading(false);
                return;
            }

            const u = userData.user;

            if (!u) {
                setUser(null);
                setProfile(null);
                cacheState = { user: null, profile: null, error: null };
                setLoading(false);
                return;
            }

            const normalizedUser: SessionUser = {
                id: u.id,
                email: u.email ?? null,
            };

            setUser(normalizedUser);
            cacheState = { ...cacheState, user: normalizedUser };

            // 2️⃣ Проверяем профиль
            const { data: prof, error: profErr } = await supabase
                .from("profiles_les")
                .select(
                    "id,email,original_email,full_name,profession,avatar_url,plan_status,plan_expires_at,created_at,updated_at"
                )
                .eq("id", u.id)
                .maybeSingle();

            if (profErr) {
                setProfile(null);
                setError(profErr.message);
                cacheState = { ...cacheState, profile: null, error: profErr.message };
                setLoading(false);
                return;
            }

            // 3️⃣ Если профиля нет — создаём
            if (!prof) {
                const { data: inserted, error: insertErr } = await supabase
                    .from("profiles_les")
                    .insert({
                        id: u.id,
                        email: u.email ?? null,
                        original_email: u.email ?? null,
                        full_name: null,
                        profession: null,
                        avatar_url: null,
                        plan_status: "free",
                        plan_expires_at: null,
                    })
                    .select(
                        "id,email,original_email,full_name,profession,avatar_url,plan_status,plan_expires_at,created_at,updated_at"
                    )
                    .single();

                if (insertErr) {
                    setProfile(null);
                    setError(insertErr.message);
                    setLoading(false);
                    return;
                }

                setProfile(inserted as CabinetProfile);
                cacheState = { ...cacheState, profile: inserted as CabinetProfile, error: null };
                setLoading(false);
                return;
            }

            if (prof.email !== (u.email ?? null)) {
                await supabase
                    .from("profiles_les")
                    .update({ email: u.email ?? null })
                    .eq("id", u.id);
            }

            if (!prof.original_email && u.email) {
                await supabase
                    .from("profiles_les")
                    .update({ original_email: u.email })
                    .eq("id", u.id);
            }

            // 4️⃣ Если профиль найден
            const normalizedProfile: CabinetProfile = {
                ...(prof as CabinetProfile),
                email: u.email ?? null,
                original_email: prof.original_email ?? u.email ?? null,
                plan_status: (prof.plan_status as CabinetProfile["plan_status"]) ?? "free",
                plan_expires_at: prof.plan_expires_at ?? null,
            };
            setProfile(normalizedProfile);
            cacheState = { ...cacheState, profile: normalizedProfile, error: null };
            setLoading(false);
        })().finally(() => {
            inFlight.current = null;
        });

        inFlight.current = promise;
        return promise;
    };

    useEffect(() => {
        load();

        const { data: sub } = supabase.auth.onAuthStateChange(() => {
            load();
        });

        return () => {
            sub.subscription.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refresh = async () => {
        await load();
    };

    return useMemo(
        () => ({
            loading,
            user,
            profile,
            error,
            refresh,
        }),
        [loading, user, profile, error]
    );
}
