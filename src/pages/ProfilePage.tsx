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

    const [fullName, setFullName] = useState<string | null>(null);
    const [profession, setProfession] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [err, setErr] = useState<string | null>(null);


    const formFullName = fullName ?? profile?.full_name ?? "";
    const formProfession = profession ?? profile?.profession ?? "";
    const formAvatarUrl = avatarUrl ?? profile?.avatar_url ?? "";

    const uploadAvatar = async (file?: File) => {
        if (!file) return;

        setErr(null);
        setUploadingAvatar(true);

        const { data: u } = await supabase.auth.getUser();
        const userId = u.user?.id;

        if (!userId) {
            setErr("Нет сессии. Перелогинься.");
            setUploadingAvatar(false);
            return;
        }

        const ext = file.name.split(".").pop() || "png";
        const filePath = `${userId}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            setErr(uploadError.message);
            setUploadingAvatar(false);
            return;
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        const { error: profileUpdateError } = await supabase
            .from("profiles_les")
            .update({ avatar_url: publicUrl })
            .eq("id", userId);

        if (profileUpdateError) {
            setErr(profileUpdateError.message);
            setUploadingAvatar(false);
            return;
        }

        setAvatarUrl(publicUrl);
        setUploadingAvatar(false);
        await refresh();
    };

    const save = async () => {
        setSaving(true);
        setErr(null);

        const name = formFullName.trim();
        const prof = formProfession.trim();

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
            .update({ full_name: name, profession: prof, avatar_url: formAvatarUrl || null })
            .eq("id", userId);

        if (error) {
            setErr(error.message);
            setSaving(false);
            return;
        }

        await refresh();

        if (onboarding) {
            // после онбординга на главную
            nav("/", { replace: true });
        }
    };

    // onboarding режим
    return (
        <div className="rounded-2xl border border-white/10 bg-[rgba(6,17,13,0.65)] backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.55)] p-5">
            <div className="text-lg font-semibold">{onboarding ? "Давай познакомимся" : "Профиль"}</div>
            {onboarding ? (
                <div className="mt-1 text-sm text-white/70">
                    Это займёт 30 секунд. Без этого меню не откроется.
                </div>
            ) : (
                <div className="mt-1 text-sm text-white/70">Обнови данные профиля и аватар в любой момент.</div>
            )}

            <div className="mt-5 grid gap-3">
                <label className="grid gap-1">
                    <span className="text-xs text-white/70">Имя</span>
                    <input
                        value={formFullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/25"
                        placeholder="Например: Илья"
                    />
                </label>

                <label className="grid gap-1">
                    <span className="text-xs text-white/70">Профессия</span>
                    <input
                        value={formProfession}
                        onChange={(e) => setProfession(e.target.value)}
                        className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/25"
                        placeholder="Например: маркетолог / дизайнер / предприниматель"
                    />
                </label>

                <div className="text-xs text-white/70">Email: {profile?.email ?? "—"}</div>

                <label className="grid gap-1">
                    <span className="text-xs text-white/70">Аватар</span>
                    {formAvatarUrl ? (
                        <img src={formAvatarUrl} alt="Аватар" className="h-20 w-20 rounded-full object-cover border border-white/20" />
                    ) : (
                        <div className="text-xs text-white/50">Аватар ещё не загружен</div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadAvatar(e.target.files?.[0])}
                        className="text-sm"
                    />
                    {uploadingAvatar ? <div className="text-xs text-white/60">Загружаю аватар…</div> : null}
                </label>

                {err ? <div className="text-sm text-red-300">{err}</div> : null}

                <button
                    onClick={save}
                    disabled={saving}
                    className="mt-2 rounded-xl bg-[#61FF8A] text-black font-semibold px-4 py-2 disabled:opacity-60"
                >
                    {saving ? "Сохраняю..." : onboarding ? "Сохранить и продолжить" : "Сохранить"}
                </button>
            </div>
        </div>
    );
}
