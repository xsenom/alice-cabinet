import React, { useEffect, useMemo, useRef, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import HScroll from "../components/ui/HScroll";
import { useSessionProfile } from "../hooks/useSessionProfile";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { buildHomePageVideos, buildHomeStories, loadHomeVideoSettings, type HomePageStory, type HomePageVideo } from "../lib/homeVideos";

type VideoItem = HomePageVideo;

type StoryItem = HomePageStory & {
    video?: VideoItem;
    locked: boolean;
};

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
                    <div className="absolute inset-0 opacity-70" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.55))" }} />
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
            <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[rgba(6,17,13,0.95)] p-3" onClick={(e) => e.stopPropagation()}>
                <div className="mb-3 flex items-center justify-between">
                    <div className="font-semibold">{video.title}</div>
                    <button type="button" onClick={onClose} className="text-white/70 hover:text-white">✕</button>
                </div>
                <video className="w-full rounded-xl border border-white/10 bg-black" controls preload="metadata" src={video.src} />
            </div>
        </div>
    );
}

function StoriesModal({
    stories,
    index,
    onClose,
    onNavigate,
}: {
    stories: StoryItem[];
    index: number;
    onClose: () => void;
    onNavigate: (nextIndex: number) => void;
}) {
    const current = stories[index];
    const canPrev = index > 0;
    const canNext = index < stories.length - 1;
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        setPaused(false);
    }, [index]);

    useEffect(() => {
        if (!current || current.locked || current.video?.src) return;
        if (paused) return;

        const id = window.setTimeout(() => {
            if (canNext) onNavigate(index + 1);
            else onClose();
        }, 5000);

        return () => window.clearTimeout(id);
    }, [current, index, canNext, onNavigate, onClose, paused]);

    const togglePause = async () => {
        if (!videoRef.current || current.locked) return;
        if (videoRef.current.paused) {
            await videoRef.current.play();
            setPaused(false);
        } else {
            videoRef.current.pause();
            setPaused(true);
        }
    };

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" onClick={onClose}>
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[rgba(6,17,13,0.97)] p-3" onClick={(e) => e.stopPropagation()}>
                <div className="mb-2 flex gap-1">
                    {stories.map((story, i) => (
                        <div key={story.id} className="h-1 flex-1 rounded-full bg-white/15">
                            <div className={`h-full rounded-full ${i <= index ? "bg-[#B56A18]" : "bg-transparent"}`} />
                        </div>
                    ))}
                </div>

                <div className="mb-2 flex items-center justify-between text-xs text-white/70">
                    <div className="font-semibold text-white">{current.title}</div>
                    <button type="button" onClick={onClose} className="text-white/80 hover:text-white">Закрыть ✕</button>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black">
                    <div className="aspect-[9/16]">
                        {current.locked ? (
                            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/85">
                                Это сторис из PRO-раздела. Открой подписку, чтобы смотреть дальше.
                            </div>
                        ) : current.video?.src ? (
                            <video
                                ref={videoRef}
                                className="h-full w-full object-cover"
                                src={current.video.src}
                                autoPlay
                                playsInline
                                onClick={() => void togglePause()}
                                onEnded={() => {
                                    if (canNext) onNavigate(index + 1);
                                    else onClose();
                                }}
                            />
                        ) : current.imageUrl ? (
                            <img src={current.imageUrl} alt={current.title} className="h-full w-full object-cover" />
                        ) : (
                            <div className="grid h-full place-items-center text-white/70">Сторис</div>
                        )}
                    </div>

                    {current.video?.src && !current.locked ? (
                        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[11px] text-white/80">
                            {paused ? "Пауза" : "Идёт воспроизведение"} — нажмите на видео
                        </div>
                    ) : null}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => canPrev && onNavigate(index - 1)} disabled={!canPrev}>
                        Назад
                    </Button>
                    <Button type="button" className="flex-1" onClick={() => (canNext ? onNavigate(index + 1) : onClose())}>
                        {canNext ? "Дальше" : "Готово"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function HomePage() {
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
    const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

    const settings = useMemo(() => loadHomeVideoSettings(), []);
    const stories = useMemo<HomePageStory[]>(() => buildHomeStories(settings), [settings]);

    const { profile } = useSessionProfile();
    const name = profile?.full_name?.trim() || "друг";

    const nav = useNavigate();
    const videos = useMemo<VideoItem[]>(() => buildHomePageVideos(settings), [settings]);

    const hasPaid =
        !!profile?.plan_expires_at &&
        new Date(profile.plan_expires_at).getTime() > Date.now() &&
        profile?.plan_status !== "free";

    const storiesFeed = useMemo<StoryItem[]>(() => {
        return stories.map((story, idx) => {
            const linked = videos[idx];
            const locked = linked ? !linked.free && !hasPaid : false;
            return {
                ...story,
                video: linked,
                locked,
            };
        });
    }, [stories, videos, hasPaid]);

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
                    {storiesFeed.map((story, index) => (
                        <button key={story.id} type="button" onClick={() => setActiveStoryIndex(index)} className="flex min-w-[76px] shrink-0 flex-col items-center gap-2 overflow-visible pt-1">
                            <div className={`grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-b ${story.tone} shadow-[0_10px_30px_rgba(0,0,0,0.35)]`}>
                                {story.imageUrl ? (
                                    <img src={story.imageUrl} alt={story.title} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="px-2 text-center text-[10px] font-bold uppercase leading-none text-[#F2F4F3]">{story.title.slice(0, 2)}</span>
                                )}
                            </div>
                            <div className="text-center text-[11px] leading-tight text-[#A9B3AE]">
                                <div className="text-[#F2F4F3]">{story.title}</div>
                                <div className="opacity-80">{story.subtitle}</div>
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
            {activeStoryIndex !== null ? (
                <StoriesModal
                    stories={storiesFeed}
                    index={activeStoryIndex}
                    onNavigate={(next) => setActiveStoryIndex(next)}
                    onClose={() => setActiveStoryIndex(null)}
                />
            ) : null}
        </>
    );
}
