import { merge, pathfy } from "@surface/core/common/object";
import { Theme }         from "./interfaces/theme";

export default class ColorBucket
{
    private static style?: HTMLStyleElement;
    private static theme: Theme = { } as Theme;

    private static update(theme: object): void
    {
        if (ColorBucket.style)
        {
            ColorBucket.style.innerHTML =
            `
                *
                {
                    ${pathfy(theme, { keySeparator: "-", valueSeparator: "-color: " }).map(x => "--smd-" + x).join(";\n")}
                }
            `;
        }
    }

    public static use(theme: Partial<Theme>): void
    {
        ColorBucket.theme = merge([ColorBucket.theme, theme]) as Theme;
    }

    public static useDark(): void
    {
        ColorBucket.update({ ...ColorBucket.theme, ...ColorBucket.theme.dark });
    }

    public static useDefault(): void
    {
        ColorBucket.update(ColorBucket.theme);
    }

    public static useLight(): void
    {
        ColorBucket.update({ ...ColorBucket.theme, ...ColorBucket.theme.light });
    }

    public static initialize(): void
    {
        const style = document.createElement("style");

        ColorBucket.style = style;

        ColorBucket.update(ColorBucket.theme);

        document.head.appendChild(style);
    }
}