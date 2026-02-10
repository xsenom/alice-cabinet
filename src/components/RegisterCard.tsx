import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";

type FieldErrors = Partial<Record<"email" | "password" | "name", string>>;

function isEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function RegisterCard() {
    const navigate = useNavigate();

    const [mode, setMode] = useState<"register" | "login">("register");
    const [showPwd, setShowPwd] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [info, setInfo] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const errors: FieldErrors = useMemo(() => {
        const e: FieldErrors = {};
        if (mode === "register" && name.trim().length < 2) e.name = "Введите имя (минимум 2 символа)";
        if (!isEmail(email)) e.email = "Проверьте email";
        if (password.length < 8) e.password = "Пароль должен быть минимум 8 символов";
        return e;
    }, [mode, name, email, password]);

    const canSubmit = Object.keys(errors).length === 0;

    async function onSubmit(ev: React.FormEvent) {
        ev.preventDefault();

        setTouched({ name: true, email: true, password: true });
        if (!canSubmit) return;

        setInfo(null);
        setErr(null);
        setBusy(true);

        try {
            if (mode === "register") {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: name } },
                });

                if (error) {
                    setErr(error.message);
                    return;
                }

                // если confirm email выключен — сессия будет сразу
                const { data: s } = await supabase.auth.getSession();
                if (s.session) {
                    navigate("/cabinet", { replace: true });
                } else {
                    setInfo("Проверьте почту: отправлена ссылка для подтверждения (если включено подтверждение email).");
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    setErr(error.message);
                    return;
                }
                navigate("/cabinet", { replace: true });
            }
        } finally {
            setBusy(false);
        }
    }

    async function onForgotPassword() {
        setInfo(null);
        setErr(null);

        if (!isEmail(email)) {
            setInfo("Сначала введите email, затем нажмите «Забыли пароль?»");
            return;
        }

        setBusy(true);
        try {
            const origin = window.location.origin;

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${origin}/reset-password`,
            });

            if (error) {
                setErr(error.message);
                return;
            }

            setInfo("Отправлена ссылка для восстановления пароля. Проверьте почту.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="w-full max-w-[520px]">
            <div className="glass p-5 sm:p-6">
                {/* header */}
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="traffic" >
                            <span className="dot red" />
                            <span className="dot yellow" />
                            <span className="dot green" />
                        </div>


                    </div>

                </div>

                <div className="mb-2">
                    <div className="text-2xl font-rubik font-semibold leading-tight">
                        {mode === "register" ? "Создать кабинет" : "Войти в кабинет"}
                    </div>

                </div>

                {(info || err) && (
                    <div
                        className="mt-4 rounded-xl px-4 py-3 text-sm"
                        style={{
                            border: err ? "1px solid rgba(255,189,46,.35)" : "1px solid rgba(33,211,139,.25)",
                            background: err ? "rgba(255,189,46,.10)" : "rgba(33,211,139,.10)",
                        }}
                    >
                        <div style={{ color: err ? "rgba(255,189,46,.92)" : "rgba(33,211,139,.92)" }}>
                            {err ?? info}
                        </div>
                    </div>
                )}

                <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                    {mode === "register" && (
                        <div>
                            <label className="mb-2 block text-sm opacity-90">Имя</label>
                            <input
                                className="field w-full px-4 py-3"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                                placeholder="Ваше имя"
                                disabled={busy}
                            />
                            {touched.name && errors.name && (
                                <div className="mt-2 text-xs" style={{ color: "rgba(255,189,46,.92)" }}>
                                    {errors.name}
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm opacity-90">Email</label>
                        <input
                            className="field w-full px-4 py-3"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                            placeholder="Ваш email"
                            inputMode="email"
                            autoComplete="email"
                            disabled={busy}
                        />
                        {touched.email && errors.email && (
                            <div className="mt-2 text-xs" style={{ color: "rgba(255,189,46,.92)" }}>
                                {errors.email}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm opacity-90">Пароль</label>
                        <div className="relative">
                            <input
                                className="field w-full px-4 py-3 pr-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                                placeholder="••••••••"
                                type={showPwd ? "text" : "password"}
                                autoComplete={mode === "register" ? "new-password" : "current-password"}
                                disabled={busy}
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-2 py-2 opacity-80 hover:opacity-100"
                                onClick={() => setShowPwd((v) => !v)}
                                aria-label={showPwd ? "Скрыть пароль" : "Показать пароль"}
                                title={showPwd ? "Скрыть пароль" : "Показать пароль"}
                                disabled={busy}
                            >
                                {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>

                        {touched.password && errors.password && (
                            <div className="mt-2 text-xs" style={{ color: "rgba(255,189,46,.92)" }}>
                                {errors.password}
                            </div>
                        )}

                        {mode === "login" && (
                            <button
                                type="button"
                                className="mt-2 w-full text-left text-xs opacity-80 hover:opacity-100"
                                onClick={onForgotPassword}
                                disabled={busy}
                            >
                                Забыли пароль?
                            </button>
                        )}
                    </div>

                    <div className="pt-2">
                        <button
                            className="btn-primary w-full px-4 py-3 font-semibold tracking-wide"
                            type="submit"
                            disabled={!canSubmit || busy}
                            style={{ opacity: canSubmit && !busy ? 1 : 0.65 }}
                        >
                            <span className="sparkles" />
                            {busy ? "Подождите..." : mode === "register" ? "Создать кабинет" : "Войти"}
                        </button>

                        <button
                            className="btn-ghost mt-3 w-full px-4 py-3 text-sm"
                            type="button"
                            onClick={() => {
                                setErr(null);
                                setInfo(null);
                                setTouched({});
                                setMode((m) => (m === "register" ? "login" : "register"));
                            }}
                            disabled={busy}
                        >
                            {mode === "register" ? "У меня уже есть кабинет" : "Мне нужен новый кабинет"}
                        </button>

                        <div className="mt-4 text-center text-xs opacity-70">
                            Нажимая кнопку, вы соглашаетесь с правилами сервиса.
                        </div>
                    </div>
                </form>
            </div>

            <div className="mt-4 flex justify-center">

            </div>
        </div>
    );
}

function EyeIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
                d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                stroke="rgba(245,240,233,.92)"
                strokeWidth="1.6"
            />
            <path
                d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
                stroke="rgba(231,199,122,.85)"
                strokeWidth="1.6"
            />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 4l16 16" stroke="rgba(245,240,233,.92)" strokeWidth="1.6" />
            <path
                d="M3 12s3.5-7 9-7c2 0 3.7.6 5.1 1.5M21 12s-3.5 7-9 7c-2 0-3.7-.6-5.1-1.5"
                stroke="rgba(245,240,233,.92)"
                strokeWidth="1.6"
            />
            <path
                d="M10.2 10.2A3.2 3.2 0 0 0 12 15.2c.6 0 1.1-.2 1.6-.4"
                stroke="rgba(231,199,122,.85)"
                strokeWidth="1.6"
            />
        </svg>
    );
}
