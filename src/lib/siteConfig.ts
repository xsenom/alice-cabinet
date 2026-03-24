import { APP_NAME } from "./branding";

export type FooterLink = {
    label: string;
    value: string;
    href?: string;
};

export const SITE_FOOTER = {
    caption: "Единое пространство для уроков, профиля и админ-управления.",
    legalText: `© ${new Date().getFullYear()} ${APP_NAME}. Все права защищены.`,
    links: [] as FooterLink[],
};
