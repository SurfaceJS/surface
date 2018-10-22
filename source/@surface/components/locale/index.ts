import enus from "./en-us.json";
import ptbr from "./pt-br.json";

const locales = { default: enus, "en-us": enus, "pt-br": ptbr };

type Locales = typeof locales;
type Locale  = keyof  Locales;

export default function localize(locale: string): Locales[Locale]
{
    return locales[locale as Locale] || locales.default;
}