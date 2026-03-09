import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase/client";
import { useSessionProfile } from "../hooks/useSessionProfile";
import Button from "../components/ui/Button";

type Plan = "free" | "paid_1m" | "paid_3m";

function getNextExpiry(months: number) {
    const dt = new Date();
    dt.setMonth(dt.getMonth() + months);
    return dt.toISOString();
}

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
    const [newEmail, setNewEmail] = useState("");
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [updatingEmail, setUpdatingEmail] = useState(false);
    const [changingPlan, setChangingPlan] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    const formFullName = fullName ?? profile?.full_name ?? "";
    const formProfession = profession ?? profile?.profession ?? "";
    const formAvatarUrl = avatarUrl ?? profile?.avatar_url ?? "";

    const currentPlan: Plan = profile?.plan_status ?? "free";
    const planExpireDate = profile?.plan_expires_at ? new Date(profile.plan_expires_at) : null;
    const hasPaidAccess = !!(planExpireDate && planExpireDate.getTime() > Date.now() && currentPlan !== "free");

    const uploadAvatar = async (file?: File) => {
        if (!file) return;

        setErr(null);
        setNotice(null);
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
        setNotice(null);

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

        const payload = {
            full_name: name,
            profession: prof,
            avatar_url: formAvatarUrl || null,
            original_email: profile?.original_email ?? profile?.email ?? null,
        };

        const { error } = await supabase.from("profiles_les").update(payload).eq("id", userId);

        if (error) {
            setErr(error.message);
            setSaving(false);
            return;
        }

        await refresh();
        setSaving(false);

        if (onboarding) {
            nav("/", { replace: true });
        }
    };

    const changeEmail = async () => {
        const email = newEmail.trim();
        if (!email) return;

        setUpdatingEmail(true);
        setErr(null);
        setNotice(null);

        const { data: u } = await supabase.auth.getUser();
        const userId = u.user?.id;

        if (!userId) {
            setErr("Нет сессии. Перелогинься.");
            setUpdatingEmail(false);
            return;
        }

        if (profile?.email === email) {
            setErr("Это уже текущая почта.");
            setUpdatingEmail(false);
            return;
        }

        const { error: authErr } = await supabase.auth.updateUser({ email });
        if (authErr) {
            setErr(authErr.message);
            setUpdatingEmail(false);
            return;
        }

        const { error: profileErr } = await supabase
            .from("profiles_les")
            .update({
                email,
                original_email: profile?.original_email ?? profile?.email ?? email,
            })
            .eq("id", userId);

        if (profileErr) {
            setErr(profileErr.message);
            setUpdatingEmail(false);
            return;
        }

        setNotice("Почта изменена. Подтверди новый email в письме. Вход дальше нужно делать по новой почте.");
        setNewEmail("");
        setUpdatingEmail(false);
        await refresh();
    };

    const setPlan = async (plan: Exclude<Plan, "free">) => {
        setChangingPlan(true);
        setErr(null);
        setNotice(null);

        const { data: u } = await supabase.auth.getUser();
        const userId = u.user?.id;
        if (!userId) {
            setErr("Нет сессии. Перелогинься.");
            setChangingPlan(false);
            return;
        }

        const months = plan === "paid_1m" ? 1 : 3;

        const { error } = await supabase
            .from("profiles_les")
            .update({
                plan_status: plan,
                plan_expires_at: getNextExpiry(months),
            })
            .eq("id", userId);

        if (error) {
            setErr(error.message);
            setChangingPlan(false);
            return;
        }

        setNotice(`Тариф активирован на ${months} мес.`);
        setChangingPlan(false);
        await refresh();
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-[rgba(6,17,13,0.65)] backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.55)] p-5">
            <div className="text-lg font-semibold">{onboarding ? "Давай познакомимся" : "Профиль"}</div>

            <div className="mt-5 grid gap-3">
                <div className="flex flex-col items-center gap-2">
                    {formAvatarUrl ? (
                        <img src={formAvatarUrl} alt="Аватар" className="h-24 w-24 rounded-full object-cover border border-white/20" />
                    ) : (
                        <div className="h-24 w-24 rounded-full border border-white/20 bg-white/5 grid place-items-center text-xs text-white/60">
                            Нет фото
                        </div>
                    )}
                    <label className="text-xs text-white/70 text-center">
                        Выберите файл
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => uploadAvatar(e.target.files?.[0])}
                            className="mt-1 block text-sm"
                        />
                    </label>
                    {uploadingAvatar ? <div className="text-xs text-white/60">Загружаю аватар…</div> : null}
                </div>

                <label className="grid gap-1">
                    <span className="text-xs text-white/70">Имя</span>
                    <input
                        value={formFullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/25"
                    />
                </label>

                <label className="grid gap-1">
                    <span className="text-xs text-white/70">Профессия</span>
                    <input
                        value={formProfession}
                        onChange={(e) => setProfession(e.target.value)}
                        className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/25"
                    />
                </label>

                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                    <div>Текущая почта: <span className="text-white/90">{profile?.email ?? "—"}</span></div>
                    <div className="text-xs text-white/60 mt-1">Первоначальная почта (сохраняется): {profile?.original_email ?? profile?.email ?? "—"}</div>
                    <div className="mt-3 flex gap-2">
                        <input
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Новая почта"
                            className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/25"
                        />
                        <Button onClick={changeEmail} disabled={updatingEmail || !newEmail.trim()}>
                            {updatingEmail ? "Смена..." : "Сменить"}
                        </Button>
                    </div>
                    <div className="mt-2 text-xs text-orange-200/90">После смены почты нужно входить по новой почте. Для сброса пароля используйте актуальный email.</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                    <div>
                        Статус: {hasPaidAccess ? "Платный" : "Бесплатный"}
                        {hasPaidAccess && planExpireDate ? ` (до ${planExpireDate.toLocaleDateString("ru-RU")})` : ""}
                    </div>
                    {!hasPaidAccess ? (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <Button onClick={() => setPlan("paid_1m")} disabled={changingPlan}>
                                Оплатить 1 месяц
                            </Button>
                            <Button onClick={() => setPlan("paid_3m")} disabled={changingPlan}>
                                Оплатить 3 месяца
                            </Button>
                        </div>
                    ) : null}
                </div>

                {err ? <div className="text-sm text-red-300">{err}</div> : null}
                {notice ? <div className="text-sm text-emerald-300">{notice}</div> : null}

                <Button onClick={save} disabled={saving} className="mt-2 w-full">
                    {saving ? "Сохраняю..." : onboarding ? "Сохранить и продолжить" : "Сохранить"}
                </Button>
            </div>
        </div>
    );
}
