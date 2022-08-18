import EN_US from "./en-us.json";
import PT_BR from "./pt-br.json";


const locales = { "pt-BR": PT_BR, "en-US": EN_US, default: PT_BR };
type Locales = typeof locales;
type Locale  = typeof EN_US;
type Keys    = keyof Locale;

type TLocalization = { [K in Keys]: Locale[K] };

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Localization extends TLocalization
{ }

class Localization
{
    public constructor(locale: string)
    {
        // return Object.assign(this, locales[language as keyof Language] ?? locales.default);
        return new Proxy(locales[locale as keyof Locales] ?? locales.default, { });
    }
}

export default Localization;