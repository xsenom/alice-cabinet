import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "@/components/Background";
import { supabase } from "@/lib/supabase/client";

export default function CabinetPage() {
    const nav = useNavigate();
    const [email, setEmail] = useState<string>("");

    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getSession();
            const user = data.session?.user;
            if (!user) return nav("/login", { replace: true });
            setEmail(user.email ?? "");
        })();
    }, [nav]);

    return (
        <Background>
            <div className="w-full max-w-[820px]">
                <div className="glass p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-2xl font-semibold">Кабинет</div>
                            <div className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                                {email}
                            </div>
                            <div className="mt-4 text-sm opacity-80">
                                Здесь будет: тарифы, оплаты, доступы.
                            </div>
                        </div>

                        <button
                            className="btn-ghost px-4 py-2 text-sm"
                            onClick={async () => {
                                await supabase.auth.signOut();
                                nav("/login", { replace: true });
                            }}
                        >
                            Выйти
                        </button>
                    </div>
                </div>
            </div>
        </Background>
    );
}
