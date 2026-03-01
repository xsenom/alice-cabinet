import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase/client";
import { useSessionProfile } from "../hooks/useSessionProfile";

export default function ProfilePage() {
    const { profile, refresh } = useSessionProfile();
    const nav = useNavigate();
    const loc = useLocation();

    const onboarding = useMemo(
        () => new URLSearchParams(loc.search).get("onboarding") === "1",
        [loc.search]
    );

    const [fullName, setFullName] = useState<string>(profile?.full_name ?? "");
    const [profession, setProfession] = useState<string>(profile?.profession ?? "");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const completed = !!(profile?.full_name?.trim() && profile?.profession?.trim());

    const save = async () => {
        setSaving(true);
        setErr(null);

        const name = fullName.trim();
        const prof = profession.trim();

        if (!name || !prof) {
            setErr("Заполни имя и профессию.");
            setSaving(false);
            return;
        }

        const { data: u } = await supabase.auth.getUser();
        const userId = u.user?.id;

        if (!userId) {
            setErr("Нет сессии. Перелогинься.");
            setSaving(false);
            return;
        }

        const { error } = await supabase
            .from("profiles_les")
            .update({ full_name: name, profession: prof })
            .eq("id", userId);

        if (error) {
            setErr(error.message);
            setSaving(false);
            return;
        }

        await refresh();

        // после онбординга на главную
        nav("/", { replace: true });
    };

    // обычный режим профиля (после onboarding)
    if (!onboarding && completed) {
        return (
            <div className="rounded-2xl border border-white/10 bg-[rgba(6,17,13,0.55)] backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.55)] p-5">
                <div className="text-lg font-semibold mb-3">Профиль</div>
                <div className="text-white/80">Имя: {profile?.full_name}</div>
                <div className="text-white/80">Профессия: {profile?.profession}</div>
            </div>
        );
    }

    // onboarding режим
    return (
        <div className="rounded-2xl border border-white/10 bg-[rgba(6,17,13,0.65)] backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.55)] p-5">
            <div className="text-lg font-semibold">Давай познакомимся</div>
            <div className="mt-1 text-sm text-white/70">
                Это займёт 30 секунд. Без этого меню не откроется.
            </div>

            <div className="mt-5 grid gap-3">
                <label className="grid gap-1">
                    <span className="text-xs text-white/70">Имя</span>
                    <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/25"
                        placeholder="Например: Илья"
                    />
                </label>

                <label className="grid gap-1">
                    <span className="text-xs text-white/70">Профессия</span>
                    <input
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/25"
                        placeholder="Например: маркетолог / дизайнер / предприниматель"
                    />
                </label>

                {err ? <div className="text-sm text-red-300">{err}</div> : null}

                <button
                    onClick={save}
                    disabled={saving}
                    className="mt-2 rounded-xl bg-[#61FF8A] text-black font-semibold px-4 py-2 disabled:opacity-60"
                >
                    {saving ? "Сохраняю..." : "Сохранить и продолжить"}
                </button>
            </div>
        </div>
    );
}
