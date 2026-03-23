import React, { useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import HScroll from "../components/ui/HScroll";
import { useSessionProfile } from "../hooks/useSessionProfile";
import { useMediaQuery } from "../hooks/useMediaQuery";

type VideoItem = { id: string; title: string; hint: string; free: boolean; src: string };

function VideoCard({
    title,
    subtitle,
    locked,
}: {
    title: string;
    subtitle: string;
    locked?: boolean;
}) {
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
                            {locked ? (
                                <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#F2F4F3]" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M7 11V8a5 5 0 0 1 10 0v3" />
                                    <rect x="5" y="11" width="14" height="10" rx="2" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#F2F4F3]" fill="currentColor">
                                    <path d="M9 7.5v9l8-4.5-8-4.5z" />
                                </svg>
                            )}
                        </div>
                    </div>
                    {locked ? (
                        <div className="absolute right-2 top-2 rounded-lg border border-[#C57A24]/30 bg-[#7E3D0A]/80 px-2 py-1 text-[11px] font-semibold text-[#F2F4F3]">
                            PRO
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="mt-3">
                <div className="text-lg font-semibold leading-tight">{title}</div>
                <div className="mt-1 text-sm text-[#A9B3AE] line-clamp-2">{subtitle}</div>
                <div className="mt-4 inline-flex items-center gap-2 text-sm text-[#A9B3AE] hover:text-[#F2F4F3]">
                    <span className="text-base">{locked ? "🔒" : "▶"}</span>
                    <span>{locked ? "Доступ по подписке" : "Смотреть"}</span>
                </div>
            </div>
        </div>
    );
}

function VideoPlayerModal({
    video,
    onClose,
}: {
    video: VideoItem;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" onClick={onClose}>
            <div
                className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[rgba(6,17,13,0.95)] p-3"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-3 flex items-center justify-between">
                    <div className="font-semibold">{video.title}</div>
                    <button type="button" onClick={onClose} className="text-white/70 hover:text-white">✕</button>
                </div>
                <video
                    className="w-full rounded-xl border border-white/10 bg-black"
                    controls
                    preload="metadata"
                    src={video.src}
                />

            </div>
        </div>
    );
}

export default function HomePage() {
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

    const stories = useMemo(
        () => [
            { title: "Старт", sub: "кому полезно", tone: "from-[#1A7A4B] to-[#0A2217]" },
            { title: "Воронка", sub: "путь", tone: "from-[#2E8A5A] to-[#0A2217]" },
            { title: "Бот", sub: "логика", tone: "from-[#0F4F38] to-[#06110D]" },
            { title: "AI", sub: "помощник", tone: "from-[#155F43] to-[#06110D]" },
            { title: "Mini App", sub: "кабинет", tone: "from-[#116C48] to-[#06110D]" },
            { title: "PRO", sub: "уроки", tone: "from-[#8B5A1A] to-[#2A1608]" },
        ],
        []
    );

    const { profile } = useSessionProfile();
    const name = profile?.full_name?.trim() || "друг";

    const nav = useNavigate();
    const videos = useMemo<VideoItem[]>(
        () => [
            { id: "v1", title: "Как пользоваться Lesik", hint: "60 секунд: трафик → бот → воронка → оплата", free: true, src: "/videos/how-to-use-lesik.mp4" },
            { id: "v2", title: "Кому будет полезно", hint: "5 кейсов: эксперты, школы, мастера, сервисы", free: true, src: "/videos/who-needs-lesik.mp4" },
            { id: "v3", title: "Mini App в Telegram", hint: "Каталог / квиз / кабинет / оплата — быстро", free: false, src: "/videos/miniapp-pro.mp4" },
        ],
        []
    );

    const hasPaid =
        !!profile?.plan_expires_at &&
        new Date(profile.plan_expires_at).getTime() > Date.now() &&
        profile?.plan_status !== "free";

    return (
        <>
            <div className="space-y-4">
                {isDesktop ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="Аватар"
                                    className="h-10 w-10 rounded-full border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)] object-cover"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full border border-white/10 bg-black shadow-[0_10px_30px_rgba(0,0,0,0.35)]" />
                            )}
                            <div className="text-base font-semibold tracking-tight">{name}, всё получится!</div>
                        </div>
                    </div>
                ) : null}

                <div className="flex gap-3 overflow-x-auto pt-1 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {stories.map((s) => (
                        <button key={s.title} className="shrink-0 min-w-[58px] flex flex-col items-center gap-2">
                            <div className={`h-10 w-10 rounded-full border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.35)] bg-gradient-to-b ${s.tone} grid place-items-center text-[10px] font-bold`}>
                                {s.title.slice(0, 2).toUpperCase()}
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
                            <div className="text-xs text-[#A9B3AE]">можно листать свайпом / мышкой влево-вправо</div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <HScroll step={260}>
                            {videos.map((v) => {
                                const locked = !v.free && !hasPaid;
                                return (
                                    <div key={v.id} className="snap-start">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (locked) return;
                                                setActiveVideo(v);
                                            }}
                                            className="text-left"
                                        >
                                            <VideoCard title={v.title} subtitle={v.hint} locked={locked} />
                                        </button>
                                    </div>
                                );
                            })}
                        </HScroll>
                    </div>
                </Card>

                {!hasPaid ? (
                    <Button variant="primary" className="w-full" onClick={() => nav("/profile")}>Купить доступ</Button>
                ) : null}
            </div>

            {activeVideo ? <VideoPlayerModal video={activeVideo} onClose={() => setActiveVideo(null)} /> : null}
        </>
    );
}
