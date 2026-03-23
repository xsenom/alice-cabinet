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

export type HomeVideoSettings = {
    slots: HomeVideoSlot[];
    urls: Record<string, string>;
};

export type HomePageVideo = {
    id: string;
    title: string;
    hint: string;
    free: boolean;
    src: string;
};

export const HOME_VIDEOS_STORAGE_KEY = "lesik.homeVideos.v1";

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

export function loadHomeVideoSettings(): HomeVideoSettings {
    const fallback: HomeVideoSettings = { slots: cloneDefaultSlots(), urls: {} };

    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const raw = window.localStorage.getItem(HOME_VIDEOS_STORAGE_KEY);
        if (!raw) return fallback;

        const parsed = JSON.parse(raw) as Partial<HomeVideoSettings>;
        const slotMap = new Map((parsed.slots ?? []).map((slot) => [slot.id, slot]));
        const slots = DEFAULT_HOME_VIDEO_SLOTS.map((slot) => ({
            ...slot,
            ...(slotMap.get(slot.id) ?? {}),
        }));

        return {
            slots,
            urls: parsed.urls ?? {},
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
