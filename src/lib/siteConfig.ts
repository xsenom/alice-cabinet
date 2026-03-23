import { APP_NAME } from "./branding";

export type FooterLink = {
    label: string;
    value: string;
    href?: string;
};

export const SITE_FOOTER = {

    legalText: `© ${new Date().getFullYear()} ${APP_NAME}. Все права защищены.`,
    links: [] as FooterLink[],
};
