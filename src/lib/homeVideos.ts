import { APP_NAME } from "./branding";

export type LessonAccess = "free" | "pro";

export type HomeVideoSlot = {
    id: string;
    title: string;
    description: string;
    videoLabel: string;
    access: LessonAccess;
    filename: string;
    publicPath: string;
};

export type HomeStoryAvatar = {
    id: string;
    title: string;
    subtitle: string;
    imagePath?: string;
    tone: string;
};

export type HomeVideoSettings = {
    slots: HomeVideoSlot[];
    urls: Record<string, string>;
    storyAvatars: HomeStoryAvatar[];
    storyImageUrls: Record<string, string>;
};

export type HomePageVideo = {
    id: string;
    title: string;
    hint: string;
    free: boolean;
    src: string;
};

export type HomePageStory = {
    id: string;
    title: string;
    subtitle: string;
    tone: string;
    imageUrl?: string;
};

export const HOME_VIDEOS_STORAGE_KEY = "lesik.homeVideos.v1";


export const DEFAULT_HOME_STORY_AVATARS: HomeStoryAvatar[] = [
    { id: "story-start", title: "Старт", subtitle: "кому полезно", imagePath: "/stories/story-start.png", tone: "from-[#1A7A4B] to-[#0A2217]" },
    { id: "story-funnel", title: "Воронка", subtitle: "путь", imagePath: "/stories/story-funnel.png", tone: "from-[#2E8A5A] to-[#0A2217]" },
    { id: "story-bot", title: "Бот", subtitle: "логика", imagePath: "/stories/story-bot.png", tone: "from-[#0F4F38] to-[#06110D]" },
    { id: "story-ai", title: "AI", subtitle: "помощник", imagePath: "/stories/story-ai.png", tone: "from-[#155F43] to-[#06110D]" },
    { id: "story-mini-app", title: "Mini App", subtitle: "кабинет", imagePath: "/stories/story-mini-app.png", tone: "from-[#116C48] to-[#06110D]" },
    { id: "story-pro", title: "PRO", subtitle: "уроки", imagePath: "/stories/story-pro.png", tone: "from-[#8B5A1A] to-[#2A1608]" },
];

export const DEFAULT_HOME_VIDEO_SLOTS: HomeVideoSlot[] = [
    {
        id: "home-how-to-use",
        title: "Как пользоваться приложением",
        description: "Онбординг-ролик для новых пользователей на главной странице.",
        videoLabel: `Как пользоваться ${APP_NAME}`,
        access: "free",
        filename: "how-to-use-lesik.mp4",
        publicPath: "/videos/how-to-use-lesik.mp4",
    },
    {
        id: "home-who-needs",
        title: "Кому будет полезно",
        description: "Короткий ролик про сценарии, кому подходит продукт.",
        videoLabel: "Кому будет полезно",
        access: "free",
        filename: "who-needs-lesik.mp4",
        publicPath: "/videos/who-needs-lesik.mp4",
    },
    {
        id: "home-miniapp-pro",
        title: "Mini App в Telegram (PRO)",
        description: "Промо-видео для платного контента на главной странице.",
        videoLabel: "Mini App в Telegram",
        access: "pro",
        filename: "miniapp-pro.mp4",
        publicPath: "/videos/miniapp-pro.mp4",
    },
];

function cloneDefaultSlots() {
    return DEFAULT_HOME_VIDEO_SLOTS.map((slot) => ({ ...slot }));
}

function cloneDefaultStoryAvatars() {
    return DEFAULT_HOME_STORY_AVATARS.map((story) => ({ ...story }));
}

export function loadHomeVideoSettings(): HomeVideoSettings {
    const fallback: HomeVideoSettings = { slots: cloneDefaultSlots(), urls: {}, storyAvatars: cloneDefaultStoryAvatars(), storyImageUrls: {} };

    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const raw = window.localStorage.getItem(HOME_VIDEOS_STORAGE_KEY);
        if (!raw) return fallback;

        const parsed = JSON.parse(raw) as Partial<HomeVideoSettings>;
        const slotMap = new Map((parsed.slots ?? []).map((slot) => [slot.id, slot]));
        const storyMap = new Map((parsed.storyAvatars ?? []).map((story) => [story.id, story]));
        const slots = DEFAULT_HOME_VIDEO_SLOTS.map((slot) => ({
            ...slot,
            ...(slotMap.get(slot.id) ?? {}),
        }));
        const storyAvatars = [
            ...DEFAULT_HOME_STORY_AVATARS.map((story) => ({
                ...story,
                ...(storyMap.get(story.id) ?? {}),
            })),
            ...(parsed.storyAvatars ?? []).filter(
                (story) => !DEFAULT_HOME_STORY_AVATARS.some((defaultStory) => defaultStory.id === story.id)
            ),
        ];

        return {
            slots,
            urls: parsed.urls ?? {},
            storyAvatars,
            storyImageUrls: parsed.storyImageUrls ?? {},
        };
    } catch {
        return fallback;
    }
}

export function saveHomeVideoSettings(settings: HomeVideoSettings) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(HOME_VIDEOS_STORAGE_KEY, JSON.stringify(settings));
}

export function buildHomePageVideos(settings: HomeVideoSettings): HomePageVideo[] {
    return settings.slots.map((slot) => ({
        id: slot.id,
        title: slot.videoLabel,
        hint: slot.description,
        free: slot.access === "free",
        src: settings.urls[slot.id] || slot.publicPath,
    }));
}


export function buildHomeStories(settings: HomeVideoSettings): HomePageStory[] {
    return settings.storyAvatars.map((story) => ({
        id: story.id,
        title: story.title,
        subtitle: story.subtitle,
        tone: story.tone,
        imageUrl: settings.storyImageUrls[story.id] || story.imagePath,
    }));
}
