import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { supabase } from "../lib/supabase/client";
import { useSessionProfile } from "../hooks/useSessionProfile";

export default function OnboardingPage() {
    const nav = useNavigate();
    const { user, profile, loading } = useSessionProfile();
    const userId = user?.id;

    const [fullName, setFullName] = useState(profile?.full_name ?? "");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    if (loading) return null;

    async function save() {
        setErr(null);
        if (!userId) return;

        const name = fullName.trim();
        if (name.length < 2) {
            setErr("Имя должно быть минимум 2 символа.");
            return;
        }

        setSaving(true);
        const { data: u } = await supabase.auth.getUser();
        const email = u.user?.email ?? null;

        const { error } = await supabase
            .from("profiles_les")
            .upsert({ id: userId, email, full_name: name }, { onConflict: "id" });

        setSaving(false);

        if (error) {
            console.error(error);
            setErr(error.message);
            return;
        }

        nav("/", { replace: true });
    }

    async function logout() {
        await supabase.auth.signOut();
        nav("/login", { replace: true });
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="w-full max-w-md p-6">
                <div className="text-2xl font-semibold">Заполни профиль</div>
                <div className="mt-2 text-sm text-white/60">
                    Это нужно, чтобы дальше всё в кабинете работало корректно.
                </div>

                <div className="mt-5">
                    <div className="text-xs text-white/60 mb-2">Имя</div>
                    <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Например: Катерина"
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") save();
                        }}
                    />
                </div>

                {err ? (
                    <div className="mt-4 text-sm text-orange-200/90 border border-orange-300/20 bg-orange-500/10 rounded-2xl p-3">
                        {err}
                    </div>
                ) : null}

                <Button className="mt-4 w-full" onClick={save}>
                    {saving ? "Сохраняю..." : "Сохранить"}
                </Button>

                <Button className="mt-3 w-full" variant="ghost" onClick={logout}>
                    Выйти
                </Button>
            </Card>
        </div>
    );
}
