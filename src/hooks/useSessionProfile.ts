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
    full_name: string | null;
    profession: string | null;
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

/* =========================
   Hook
========================= */

export function useSessionProfile(): State {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<SessionUser | null>(null);
    const [profile, setProfile] = useState<CabinetProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    // защита от двойного вызова в StrictMode
    const inFlight = useRef<Promise<void> | null>(null);

    const load = async (): Promise<void> => {
        if (inFlight.current) return inFlight.current;

        const promise = (async () => {
            setLoading(true);
            setError(null);

            // 1️⃣ Получаем пользователя
            const { data: userData, error: userErr } =
                await supabase.auth.getUser();

            if (userErr) {
                setUser(null);
                setProfile(null);
                setError(userErr.message);
                setLoading(false);
                return;
            }

            const u = userData.user;

            if (!u) {
                setUser(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            const normalizedUser: SessionUser = {
                id: u.id,
                email: u.email ?? null,
            };

            setUser(normalizedUser);

            // 2️⃣ Проверяем профиль
            const { data: prof, error: profErr } = await supabase
                .from("profiles_les")
                .select(
                    "id,email,full_name,profession,created_at,updated_at"
                )
                .eq("id", u.id)
                .maybeSingle();

            if (profErr) {
                setProfile(null);
                setError(profErr.message);
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
                        full_name: null,
                        profession: null,
                    })
                    .select(
                        "id,email,full_name,profession,created_at,updated_at"
                    )
                    .single();

                if (insertErr) {
                    setProfile(null);
                    setError(insertErr.message);
                    setLoading(false);
                    return;
                }

                setProfile(inserted as CabinetProfile);
                setLoading(false);
                return;
            }

            // 4️⃣ Если профиль найден
            setProfile(prof as CabinetProfile);
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