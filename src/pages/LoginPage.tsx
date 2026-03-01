import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { supabase } from "../lib/supabase/client";

export default function LoginPage() {
    const nav = useNavigate();
    const location = useLocation() as any;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const canSubmit = useMemo(() => {
        return email.trim().length >= 5 && password.length >= 6 && !loading;
    }, [email, password, loading]);

    async function signIn() {
        setErr(null);
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        setLoading(false);

        if (error) {
            setErr(error.message);
            return;
        }

        // куда возвращаться после логина (если пришли из гарда)
        const from = location?.state?.from;
        nav(from || "/", { replace: true });
    }

    async function resetPassword() {
        setErr(null);
        const e = email.trim();
        if (!e) {
            setErr("Введи email, чтобы отправить ссылку для восстановления.");
            return;
        }

        setLoading(true);
        // для reset желательно указать redirectTo на страницу /reset-password (если сделана)
        const { error } = await supabase.auth.resetPasswordForEmail(e, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        setLoading(false);

        if (error) {
            setErr(error.message);
            return;
        }
        setErr("Письмо для восстановления отправлено (если email зарегистрирован).");
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="w-full max-w-md p-6">
                <div className="mb-5">
                    <div className="text-2xl font-semibold">Войти в кабинет</div>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="text-xs text-white/60 mb-2">Email</div>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ваш email"
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
                        />
                    </div>

                    <div>
                        <div className="text-xs text-white/60 mb-2">Пароль</div>
                        <div className="relative">
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type={show ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 pr-12 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && canSubmit) signIn();
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShow((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:text-white"
                                aria-label="toggle password"
                            >
                                {show ? "🙈" : "👁️"}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={resetPassword}
                            className="mt-2 text-xs text-white/60 hover:text-white"
                        >
                            Забыли пароль?
                        </button>
                    </div>

                    {err ? (
                        <div className="text-sm text-orange-200/90 border border-orange-300/20 bg-orange-500/10 rounded-2xl p-3">
                            {err}
                        </div>
                    ) : null}

                    <Button
                        onClick={signIn}
                        className="w-full"
                        variant="primary"
                    >
                        {loading ? "Входим..." : "Войти"}
                    </Button>

                    <Link to="/register" className="block">
                        <Button className="w-full" variant="ghost">
                            Мне нужен новый кабинет
                        </Button>
                    </Link>

                    <div className="text-[11px] text-white/45 text-center">
                        Нажимая кнопку, вы соглашаетесь с правилами сервиса.
                    </div>
                </div>
            </Card>
        </div>
    );
}
