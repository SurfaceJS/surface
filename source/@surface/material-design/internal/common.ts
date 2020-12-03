/* eslint-disable sort-keys */
import { Swatch, hexToHsva, hsvaToHex, interpolateSwatches, scaleSwatches } from "@surface/color";
import { Indexer, camelToDashed, objectFactory, pathfy, typeGuard }         from "@surface/core";
import RawPalette                                                           from "../types/raw-palette";
import RawTheme                                                             from "../types/raw-theme";
import Shades                                                               from "../types/shades";

type Theme<T extends RawPalette | RawTheme> =
    T extends RawPalette
        ? { light: { [K in keyof T]: Shades } }
        : T extends RawTheme
            ? { [K in keyof T]-?: { [K1 in keyof T[K]]: Shades } }
            : never;

function interpolate(color: string|Shades): [string, string][]
{
    const entries = typeof color == "string" ? [["500", color]] : Object.entries(color) as [string, string][];

    const base:   string[][] = [];
    const accent: string[][] = [];

    entries.forEach(x => x[0].startsWith("A") ? accent.push(x) : base.push(x));

    if (base.length == 10 && accent.length == 4)
    {
        return [...base, ...accent] as [string, string][];
    }

    const baseSwatches   = base.map(([key, value]) => ({ index: key == "50" ? 1 : Number.parseInt(key) / 100 + 1, color: hexToHsva(value) }));
    const accentSwatches = accent.map(([key, value]) => ({ index: Number.parseInt(key.replace("A", "")) / 100, color: hexToHsva(value) }));

    const baseInterpolation = baseSwatches.length == 10
        ? baseSwatches
        : interpolateSwatches(baseSwatches, { start: 1, end: 10 });

    const accentInterpolation = accentSwatches.length == 4
        ? accentSwatches
        : accentSwatches.length > 0
            ? interpolateSwatches(accentSwatches, { start: 1, end: 7 })
            : scaleSwatches(baseInterpolation, 1.05);

    return [...baseInterpolation.map(resolveSwatch), ...accentInterpolation.filter(x => [4, 6, 7, 8].includes(x.index)).map(resolveAccentSwatch)];
}

function resolveAccentSwatch(swatch: Swatch): [string, string]
{
    const map: Record<number, number> = { 4: 1, 6: 2, 7: 4, 8: 7 };

    return [`A${(map[swatch.index] * 100).toString()}`, hsvaToHex(swatch.color)];
}

function resolveSwatch(swatch: Swatch): [string, string]
{
    return [swatch.index == 1 ? "50" : ((swatch.index - 1) * 100).toString(), hsvaToHex(swatch.color)];
}

export function generateTheme<T extends RawPalette|RawTheme>(raw: T): Theme<T>
{
    const themes: Indexer = { };

    if (typeGuard<Theme<T>>(raw, "dark" in raw || "light" in raw))
    {
        for (const [themeKey, themeValue] of Object.entries(raw) as [string, RawPalette][])
        {
            const theme: Indexer = themes[themeKey] = { };

            for (const [name, color] of Object.entries(themeValue) as [string, string|Shades][])
            {
                theme[name] = objectFactory(interpolate(color));
            }
        }
    }
    else
    {
        const theme = themes.light = { } as Indexer;

        for (const [name, color] of Object.entries(raw))
        {
            theme[name] = objectFactory(interpolate(color));
        }
    }

    return themes as Theme<T>;
}

export function generateCssVariables(source: object): string[]
{
    const defaultWeightPattern = /-500:/;
    const accentPattern        = /A[1247]00/;

    const variables = pathfy(source, { keySeparator: "-", keyTranform: x => accentPattern.test(x) ? x : camelToDashed(x) }).map(x => `--smd-${x};`);
    const defaults  = variables.filter(x => x.includes("-500:")).map(x => x.replace(defaultWeightPattern, ":"));

    return defaults.concat(variables);
}
