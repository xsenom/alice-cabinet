import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { supabase } from "../lib/supabase/client";

function mapSignUpError(message: string) {
    if (message.includes("Error sending confirmation email")) {
        return "Не удалось отправить письмо подтверждения. Проверь SMTP в Supabase (Auth → Email → SMTP Settings) или временно выключи Confirm email в Auth settings.";
    }

    return message;
}

export default function RegisterPage() {
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const canSubmit = useMemo(() => {
        return (
            email.trim().length >= 5 &&
            password.length >= 6 &&
            password === password2 &&
            !loading
        );
    }, [email, password, password2, loading]);

    async function signUp() {
        setErr(null);
        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/login`,
            },
        });

        setLoading(false);

        if (error) {
            setErr(mapSignUpError(error.message));
            return;
        }

        // Если подтверждение email включено — сессия может не появиться сразу.
        // В любом случае ведём на логин или на onboarding.
        if (data.session) {
            nav("/profile?onboarding=1", { replace: true });
        } else {
            setErr("Проверь почту и подтверди email, затем войди в кабинет.");
            // можно: nav("/login")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="w-full max-w-md p-6">
                <div className="text-2xl font-semibold">Новый кабинет</div>
                <div className="mt-2 text-sm text-white/60">
                    Создай логин и пароль, затем заполни профиль.
                </div>

                <div className="mt-5 space-y-4">
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
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Минимум 6 символов"
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
                        />
                    </div>

                    <div>
                        <div className="text-xs text-white/60 mb-2">Повтори пароль</div>
                        <input
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            type="password"
                            placeholder="Повтори пароль"
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && canSubmit) signUp();
                            }}
                        />
                    </div>

                    {err ? (
                        <div className="text-sm text-orange-200/90 border border-orange-300/20 bg-orange-500/10 rounded-2xl p-3">
                            {err}
                        </div>
                    ) : null}

                    <Button className="w-full" onClick={signUp}>
                        {loading ? "Создаю..." : "Создать кабинет"}
                    </Button>

                    <Link to="/login" className="block">
                        <Button className="w-full" variant="ghost">
                            У меня уже есть кабинет
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
