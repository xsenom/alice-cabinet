import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "@/components/Background";
import { supabase } from "@/lib/supabase/client";

function parseHash() {
    const h = window.location.hash || "";
    const s = new URLSearchParams(h.startsWith("#") ? h.slice(1) : h);
    return {
        access_token: s.get("access_token"),
        refresh_token: s.get("refresh_token"),
        type: s.get("type"),
    };
}

export default function ResetPasswordPage() {
    const nav = useNavigate();
    const [pwd, setPwd] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const { access_token, refresh_token, type } = parseHash();
            if (type === "recovery" && access_token && refresh_token) {
                const { error } = await supabase.auth.setSession({ access_token, refresh_token });
                if (error) setErr(error.message);
            }
        })();
    }, []);

    async function save() {
        setErr(null);
        setOk(null);
        if (pwd.length < 8) return setErr("Пароль минимум 8 символов");

        const { error } = await supabase.auth.updateUser({ password: pwd });
        if (error) return setErr(error.message);

        setOk("Пароль обновлён. Перенаправляю на главную…");
        setTimeout(() => nav("/", { replace: true }), 700);
    }

    return (
        <Background>
            <div className="w-full max-w-[520px]">
                <div className="glass p-5 sm:p-6">
                    <div className="text-2xl font-semibold">Новый пароль</div>
                    <div className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                        Введите новый пароль для аккаунта.
                    </div>

                    <div className="mt-6 space-y-3">
                        <input
                            className="field w-full px-4 py-3"
                            placeholder="Новый пароль (мин. 8 символов)"
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                            type="password"
                        />

                        <button className="btn-primary w-full px-4 py-3 font-semibold" onClick={save}>
                            <span className="sparkles" />
                            Сохранить пароль
                        </button>

                        {err && <div className="text-sm" style={{ color: "rgba(255,189,46,.92)" }}>{err}</div>}
                        {ok && <div className="text-sm" style={{ color: "rgba(33,211,139,.92)" }}>{ok}</div>}
                    </div>
                </div>
            </div>
        </Background>
    );
}
