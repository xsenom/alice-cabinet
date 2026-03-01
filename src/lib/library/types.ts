export type TopicKey = "Воронки" | "Боты" | "AI" | "Mini App";

export type LessonComment = {
    lessonId: string;
    text: string;   // <-- обязательно string
    ts: string;
};

export type LessonPdf = {
    name: string;
    pages?: number;
};

export type LessonQuestion = {
    id: string;
    text: string;   // <-- обязательно string
    required?: boolean;
};

export type LessonTask = {
    title: string;              // <-- обязательно string
    questions: LessonQuestion[];
};

export type LessonVideo = {
    label?: string;             // <-- string
    url?: string;
};

export type Lesson = {
    id: string;
    n: number;
    title: string;              // <-- string
    goal: string;               // <-- string
    needTask: boolean;
    video?: LessonVideo;
    pdfs: LessonPdf[];
    task: LessonTask;
};
