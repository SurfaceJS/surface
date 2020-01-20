import { typeGuard } from "@surface/core/common/generic";

export type HSL = { h: number, s: number, l: number };
export type RGB = { r: number, g: number, b: number };

// see: https://en.wikipedia.org/wiki/RGB_color_model
// see: https://en.wikipedia.org/wiki/HSL_and_HSV

/** returns the average of the supplied number arguments */
function average(...args: Array<number>): number
{
    return args.length ? args.reduce((p, c) => p + c, 0) / args.length : 0;
}

/**
 * expects value to be number in interval [0, 255]
 * returns normalised value as a number interval [0, 1]
 */
function colorRange(value: number): number
{
    return value / 255;
}

/** converts a hexidecimal string into a decimal number */
function hex2dec(value: string): number
{
    return Number.parseInt(value, 16);
}

/** format hex pair string from value */
function hexPair(value: string): number
{
    return hex2dec(value.padStart(2, "0"));
}

function hue(r: number, g: number, b: number, cmax: number, chroma: number): number
{
    let hue = 0;

    if (chroma == 0)
    {
      return hue;
    }
    if (cmax === r)
    {
        hue = ((g - b) / chroma) % 6;
    }
    else if (cmax === g)
    {
        hue = ((b - r) / chroma) + 2;
    }
    else if (cmax === b)
    {
        hue = ((r - g) / chroma) + 4;
    }

    hue *= 60;

    return hue < 0 ? hue + 360 : hue;
}

export function hueToRgb(t1: number, t2: number, hue: number): number
{
    if (hue < 0) { hue += 6; }
    if (hue >= 6) { hue -= 6; }
    if (hue < 1) { return (t2 - t1) * hue + t1; }
    else if(hue < 3) { return t2; }
    else if(hue < 4) { return (t2 - t1) * (4 - hue) + t1; }
    else { return t1; }
}

/**
 * expects R, G, B, Cmin, Cmax and chroma to be in number interval [0, 1]
 * type is by default 'bi-hexcone' equation
 * set 'luma601' or 'luma709' for alternatives
 * see: https://en.wikipedia.org/wiki/Luma_(video)
 * returns a number interval [0, 1]
*/
function lightness(r: number, g: number, b: number, cmin: number, cmax: number, type = "bi-hexcone"): number
{
    if (type === "luma601")
    {
        return (r * 0.299) + (g * 0.587) + (b * 0.114);
    }

    if (type === "luma709")
    {
        return (r * 0.2126) + (g * 0.7152) + (b * 0.0772);
    }

    return average(cmin, cmax);
}

/**
 * expects L and chroma to be in number interval [0, 1]
 * returns a number interval [0, 1]
 */
function saturation(l: number, chroma: number): number
{
    return chroma == 0 ? 0 : chroma / (1 - Math.abs(l * 2 - 1));
}

/** returns the value to a fixed number of digits */
function toFixed(value: number, digits: number): number
{
    return Number.parseFloat(value.toFixed(digits));
}

/**
 * expects R, G, and B to be in number interval [0, 1]
 * returns a Map of H, S and L in the appropriate interval and digits
 */
export function rgbToHsl(rgb: string): HSL;
export function rgbToHsl(rgb: RGB): HSL;
export function rgbToHsl(r: string, g: string, b: string): HSL;
export function rgbToHsl(r: number, g: number, b: number): HSL;
export function rgbToHsl(...args: [string|RGB]|[string, string, string]|[number, number, number]): HSL
{
    let r: number;
    let g: number;
    let b: number;

    if (args.length == 1)
    {
        if (typeof args[0] == "string")
        {
            const rgb = args[0];

            const hex = (rgb.charAt(0) === "#" ? rgb.slice(1) : rgb).padStart(6, "0");

            const [_r, _g, _b] = hex.match(/../g)?.slice(0, 3) ?? ["ff", "ff", "ff"];

            r = colorRange(hexPair(_r));
            g = colorRange(hexPair(_g));
            b = colorRange(hexPair(_b));
        }
        else
        {
            r = args[0].r;
            g = args[0].g;
            b = args[0].b;
        }
    }
    else if (typeGuard<[string, string, string]>(args, typeof args[0] == "string"))
    {
        r = colorRange(hexPair(args[0]));
        g = colorRange(hexPair(args[1]));
        b = colorRange(hexPair(args[2]));
    }
    else
    {
        r = args[0];
        g = args[1];
        b = args[2];
    }

    const cmin   = Math.min(r, g, b);
    const cmax   = Math.max(r, g, b);
    const chroma = cmax - cmin;

    const l = lightness(r, g, b, cmin, cmax);

    // H in degrees interval [0, 360]
    // L and S in interval [0, 1]
    return {
        h: toFixed(hue(r, g, b, cmax, chroma), 0),
        s: toFixed(saturation(l / 255, chroma / 255), 1),
        l: toFixed(l / 255, 1)
    };
}

export function rgbToHue(r: number, g: number, b: number): number
{
    r = r /= 255;
    g = g /= 255;
    b = b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    const chroma = max - min;

    return toFixed(hue(r, g, b, max, chroma), 0);
}

/**
* @param hsl HSL object
*/
export function hslToRgb(hsl: HSL): RGB;
/**
 * @param h The hue [0..255]
 * @param s The saturation [0..1]
 * @param l The lightness [0..1]
 */
export function hslToRgb(h: number, s: number, l: number): RGB;
/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 */
export function hslToRgb(...args: [HSL]|[number, number, number]): RGB
{
    const { h, s, l } = args.length == 1 ? args[0] : { h: args[0], s: args[1], l: args[2] };

    if (s == 0)
    {
        const value = l * 255;

        return { r: value, g: value, b: value };
    }

    const q = l <= 0.5 ? l * (s + 1) : l + s - l * s;
    const p = l * 2 - q;

    const hue = h / 60;

    const r = toFixed(hueToRgb(p, q, hue + 2) * 255, 0);
    const g = toFixed(hueToRgb(p, q, hue) * 255, 0);
    const b = toFixed(hueToRgb(p, q, hue - 2) * 255, 0);

    return { r, g, b };
}