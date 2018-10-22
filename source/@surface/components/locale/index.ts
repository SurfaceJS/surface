import enus from "./en-us.json";
import ptbr from "./pt-br.json";

const locales = { default: enus, "en-US": enus, "pt-BR": ptbr };

type Locales = typeof locales;
type Locale  = keyof Locales;

export type Localization = Locales["default"];

export default function localize(locale: string): Localization
{
    return locales[locale as Locale] || locales.default;
}