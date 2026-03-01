import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";

export type Profile = {
    user_id: string;
    full_name: string | null;
    username: string | null;
    is_onboarded: boolean;
};


export function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const m = window.matchMedia(query);
        const onChange = () => setMatches(m.matches);
        onChange();
        m.addEventListener?.("change", onChange);
        return () => m.removeEventListener?.("change", onChange);
    }, [query]);

    return matches;
}
export function useSessionProfile() {
    const [loading, setLoading] = useState(true);
    const [sessionUserId, setSessionUserId] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        let alive = true;

        async function run() {
            setLoading(true);

            const { data: auth } = await supabase.auth.getUser();
            const user = auth.user;

            if (!alive) return;

            if (!user) {
                setSessionUserId(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            setSessionUserId(user.id);

            const { data, error } = await supabase
                .from("profiles")
                .select("user_id, full_name, username, is_onboarded")
                .eq("user_id", user.id)
                .maybeSingle();

            if (!alive) return;

            if (error) {
                // если таблица/политики не готовы — увидишь в консоли
                console.error("profiles select error:", error);
                setProfile(null);
            } else {
                setProfile(data ?? null);
            }

            setLoading(false);
        }

        run();

        const { data: sub } = supabase.auth.onAuthStateChange(() => {
            run();
        });

        return () => {
            alive = false;
            sub.subscription.unsubscribe();
        };
    }, []);

    return { loading, sessionUserId, profile };
}
