// eslint-disable-next-line import/prefer-default-export
export function stringToCSSStyleSheet(source: string): CSSStyleSheet
{
    const sheet = new CSSStyleSheet() as CSSStyleSheet & { replaceSync: (source: string) => void };

    sheet.replaceSync(source);
    sheet.toString = () => source;

    return sheet;
}