import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";

type Stats = {
    total: number;
    admins: number;
    free: number;
    paid1m: number;
    paid3m: number;
};

export default function AdminPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<Stats>({ total: 0, admins: 0, free: 0, paid1m: 0, paid3m: 0 });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);

            const [all, admins, free, paid1m, paid3m] = await Promise.all([
                supabase.from("profiles_les").select("id", { head: true, count: "exact" }),
                supabase.from("profiles_les").select("id", { head: true, count: "exact" }).eq("status_admin", true),
                supabase.from("profiles_les").select("id", { head: true, count: "exact" }).eq("plan_status", "free"),
                supabase.from("profiles_les").select("id", { head: true, count: "exact" }).eq("plan_status", "paid_1m"),
                supabase.from("profiles_les").select("id", { head: true, count: "exact" }).eq("plan_status", "paid_3m"),
            ]);

            const firstError = all.error || admins.error || free.error || paid1m.error || paid3m.error;
            if (firstError) {
                setError(firstError.message);
                setLoading(false);
                return;
            }

            setStats({
                total: all.count ?? 0,
                admins: admins.count ?? 0,
                free: free.count ?? 0,
                paid1m: paid1m.count ?? 0,
                paid3m: paid3m.count ?? 0,
            });
            setLoading(false);
        };

        load();
    }, []);

    return (
        <div className="rounded-3xl border border-white/10 bg-[rgba(6,17,13,0.72)] p-5 backdrop-blur-xl">
            <div className="text-2xl font-semibold">Админ-панель</div>
            <div className="mt-1 text-sm text-white/70">Статистика клиентов и тарифов</div>

            {loading ? <div className="mt-4 text-white/70">Загрузка...</div> : null}
            {error ? <div className="mt-4 text-red-300">Ошибка: {error}</div> : null}

            {!loading && !error ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Card title="Всего клиентов" value={stats.total} />
                    <Card title="Администраторы" value={stats.admins} />
                    <Card title="Бесплатный" value={stats.free} />
                    <Card title="Тариф 1 месяц" value={stats.paid1m} />
                    <Card title="Тариф 3 месяца" value={stats.paid3m} />
                </div>
            ) : null}
        </div>
    );
}

function Card({ title, value }: { title: string; value: number }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm text-white/70">{title}</div>
            <div className="mt-1 text-3xl font-semibold">{value}</div>
        </div>
    );
}
