import { generatePallete, hexToHsv, hsvToHex, palleteScale, Swatch } from "@surface/color";
import { DeepPartial, Indexer }                                      from "@surface/core";
import { typeGuard }                                                 from "@surface/core/common/generic";
import { objectFactory, pathfy }                                     from "@surface/core/common/object";
import { camelToDashed }                                             from "@surface/core/common/string";
import { Color }                                                     from "../interfaces/color";
import ITheme                                                        from "../interfaces/theme";
import IThemes                                                       from "../interfaces/themes";

function resolveAccentSwatch(swatch: Swatch): [string, string]
{
    const map: Record<number, number> = { 4: 1, 6: 2, 7: 4, 8: 7 };

    return ["A" + (map[swatch.index] * 100).toString(), hsvToHex(swatch.color)];
}

function resolveSwatch(swatch: Swatch): [string, string]
{
    return [swatch.index == 1 ? "50" : ((swatch.index - 1) * 100).toString(), hsvToHex(swatch.color)];
}

function generateVariations(color: string|Color): Array<[string, string]>
{
    const entries = typeof color == "string" ? [["500", color]] : Object.entries(color);

    const base:   Array<Array<string>> = [];
    const accent: Array<Array<string>> = [];

    entries.forEach(x => x[0].startsWith("A") ? accent.push(x) : base.push(x));

    if (base.length == 10 && accent.length == 4)
    {
        return [...base, ...accent] as Array<[string, string]>;
    }

    const baseSwatches   = base.map(([key, value]) => ({ index: key == "50" ? 1 : (Number.parseInt(key) / 100) + 1, color: hexToHsv(value) }));
    const accentSwatches = accent.map(([key, value]) => ({ index: (Number.parseInt(key.replace("A", "")) / 100), color: hexToHsv(value) }));

    const basePallete = baseSwatches.length == 10
        ? baseSwatches
        : generatePallete(baseSwatches, { start: 1, end: 10 });

    const accentPallete = accentSwatches.length == 4
        ? accentSwatches
        : accentSwatches.length > 0
            ? generatePallete(accentSwatches, { start: 1, end: 7 })
            : palleteScale(basePallete, 1.05);

    return [...basePallete.map(resolveSwatch), ...accentPallete.filter(x => [4, 6, 7, 8].includes(x.index)).map(resolveAccentSwatch)];
}

export function generateThemes(raw: DeepPartial<ITheme>|DeepPartial<IThemes>): IThemes
{
    const themes: Indexer = { };

    if (typeGuard<IThemes>(raw, "dark" in raw || "light" in raw))
    {
        for (const [themeKey, themeValue] of Object.entries(raw) as Array<[string, ITheme]>)
        {
            const theme: Indexer = themes[themeKey] = { };

            for (const [name, color] of Object.entries(themeValue))
            {
                theme[name] = objectFactory(generateVariations(color));
            }
        }
    }
    else
    {
        const theme = themes["light"] = { } as Indexer;

        for (const [name, color] of Object.entries(raw))
        {
            theme[name] = objectFactory(generateVariations(color));
        }
    }

    return themes as IThemes;
}

export function generateCssVariables(source: object): Array<string>
{
    const defaultWeightPattern = /--500:/;
    const accentPattern        = /A[1247]00/;

    const variables = pathfy(source, { keySeparator: "--", keyTranform: x => accentPattern.test(x) ? x : camelToDashed(x) }).map(x => `--smd--${x};`);
    const defaults  = variables.filter(x => defaultWeightPattern.test(x)).map(x => x.replace(defaultWeightPattern, ":"));

    return defaults.concat(variables);
}
