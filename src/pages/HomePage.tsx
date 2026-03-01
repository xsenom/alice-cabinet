import React, { useMemo } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import HScroll from "../components/ui/HScroll";
import logo from "../assets/lesik-logo.png";
import { useSessionProfile } from "../hooks/useSessionProfile";

function VideoCard({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="shrink-0 w-[240px]">
            <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/20">
                <div className="relative aspect-[16/9]">
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(520px 320px at 30% 20%, rgba(97,255,138,0.18) 0%, rgba(13,36,26,0.35) 45%, rgba(0,0,0,0.45) 100%)",
                        }}
                    />
                    <div
                        className="absolute inset-0 opacity-70"
                        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.55))" }}
                    />
                    <div className="absolute inset-0 grid place-items-center">
                        <div className="h-12 w-12 rounded-full border border-white/15 bg-black/25 backdrop-blur-md grid place-items-center">
                            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#F2F4F3]" fill="currentColor">
                                <path d="M9 7.5v9l8-4.5-8-4.5z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-3">
                <div className="text-lg font-semibold leading-tight">{title}</div>
                <div className="mt-1 text-sm text-[#A9B3AE] line-clamp-2">{subtitle}</div>
                <button className="mt-4 inline-flex items-center gap-2 text-sm text-[#A9B3AE] hover:text-[#F2F4F3]">
                    <span className="text-base">▶</span>
                    <span>Смотреть</span>
                </button>
            </div>
        </div>
    );
}

export default function HomePage() {
    const stories = useMemo(
        () => [
            { title: "Старт", sub: "кому полезно" },
            { title: "Воронка", sub: "путь" },
            { title: "Бот", sub: "логика" },
            { title: "AI", sub: "помощник" },
            { title: "Mini App", sub: "кабинет" },
            { title: "PRO", sub: "уроки" },
        ],
        []
    );
    const { profile } = useSessionProfile();
    const name = profile?.full_name?.trim() || "друг";

    const nav = useNavigate();
    const videos = useMemo(
        () => [
            { id: "v1", title: "Как пользоваться Lesik", hint: "60 секунд: трафик → бот → воронка → оплата" },
            { id: "v2", title: "Кому будет полезно", hint: "5 кейсов: эксперты, школы, мастера, сервисы" },
            { id: "v3", title: "Mini App в Telegram", hint: "Каталог / квиз / кабинет / оплата — быстро" },
        ],
        []
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="h-10 w-10 rounded-full border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                        style={{
                            background:
                                "radial-gradient(18px 18px at 32% 38%, rgba(97,255,138,0.95) 0%, rgba(97,255,138,0.55) 35%, rgba(0,0,0,0) 60%), radial-gradient(18px 18px at 68% 38%, rgba(97,255,138,0.95) 0%, rgba(97,255,138,0.55) 35%, rgba(0,0,0,0) 60%), radial-gradient(180px 120px at 50% 25%, rgba(183,168,94,0.08) 0%, rgba(0,0,0,0) 60%), linear-gradient(180deg, rgba(16,42,32,0.95) 0%, rgba(6,17,13,0.95) 100%)",
                        }}
                    />
                    <div className="text-base font-semibold tracking-tight">
                        {name}, всё получится!
                    </div>
                </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1">
                {stories.map((s) => (
                    <button key={s.title} className="shrink-0 flex flex-col items-center gap-2">
                        <div className="h-10 w-10 rounded-full border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden bg-black/20">
                            <img
                                src={logo}
                                alt="LESik"
                                className="h-full w-full object-cover"
                                draggable={false}
                            />
                        </div>
                        <div className="text-[11px] text-[#A9B3AE] leading-tight text-center">
                            <div className="text-[#F2F4F3]">{s.title}</div>
                            <div className="opacity-80">{s.sub}</div>
                        </div>
                    </button>
                ))}
            </div>

            <Card className="p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xl font-semibold tracking-tight">Видео</div>
                        <div className="text-xs text-[#A9B3AE]">как пользоваться и кому полезно</div>
                    </div>
                    <button className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/7 grid place-items-center text-[#A9B3AE] hover:text-[#F2F4F3]">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>

                <div className="mt-4">
                    <HScroll step={260}>
                        {videos.map((v) => (
                            <div key={v.id} className="snap-start">
                                <button
                                    type="button"
                                    onClick={() => nav(`/app/library?open=${encodeURIComponent(v.id)}`)}
                                    className="text-left"
                                >
                                    <VideoCard title={v.title} subtitle={v.hint} />
                                </button>
                            </div>
                        ))}
                    </HScroll>
                </div>
            </Card>

            <Button variant="primary" className="w-full">
                Купить доступ
            </Button>
        </div>
    );
}
