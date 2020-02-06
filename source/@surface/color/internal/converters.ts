// Reference: https://www.easyrgb.com/en/math.php

export type HSL = { h: number, s: number, l: number };
export type HSV = { h: number, s: number, v: number };
export type LAB = { l: number, a: number, b: number };
export type RGB = { r: number, g: number, b: number };
export type XYZ = { x: number, y: number, z: number };

const ILLUMINANT_D65 = { X: 95.047, Y: 100, Z: 108.883 };

const deltaChannel      = (chroma: number, max: number) => (channel: number) => (((max - channel) / 6) + (chroma / 2)) / chroma;
const labToXyzTransform = (channel: number) => channel ** 3 > 0.008856 ? channel ** 3 : (channel - 16 / 116) / 7.787;
const rgbToXyzTransform = (channel: number) => (channel > 0.04045 ? ((channel + 0.055) / 1.055) ** 2.4 : channel / 12.92) * 100;
const xyzToLabTransform = (channel: number) => channel > 0.008856 ? channel ** (1 / 3) : (channel * 7.787) + (16 / 116);
const xyzToRgbTransform = (channel: number) => channel > 0.0031308 ? (channel ** (1 / 2.4)) * 1.055 - 0.055 : channel / 12.92;

function hueToRgb(v1: number, v2: number, h: number): number
{
    if (h < 0) { h += 1; }
    if (h > 1) { h -= 1; }

    if ((h * 6) < 1) { return v1 + (v2 - v1) * 6 * h; }
    if ((h * 2) < 1) { return v2; }
    if ((h * 3) < 2) { return v1 + ( v2 - v1 ) * ( ( 2 / 3 ) - h ) * 6; }

    return v1;
}

function range(value: number, min: number, max: number): number
{
    return Math.max(Math.min(value, max), min);
}

function rgbToHue(r: number, g: number, b: number, chroma: number, max: number): number
{
    const delta = deltaChannel(chroma, max);

    const h = r == max
        ? delta(b) - delta(g)
        : g == max
            ? (1 / 3) + delta(r) - delta(b)
            : b == max
                ? (2 / 3) + delta(g) - delta(r)
                : 0;

    return h < 0
        ? h + 1
        : h > 1
            ? h - 1
            : h;
}


/** returns the value to a fixed number of digits */
function toFixed(value: number, digits?: number): number
{
    return Number.parseFloat(value.toFixed(digits ?? 0));
}

export function hexToHsl(hex: string): HSL
{
    return rgbToHsl(hexToRgb(hex));
}

export function hexToHsv(hex: string): HSV
{
    return rgbToHsv(hexToRgb(hex));
}

export function hslToHex(hsl: HSL): string
{
    return rgbToHex(hslToRgb(hsl));
}

export function hsvToHex(hsv: HSV): string
{
    return rgbToHex(hsvToRgb(hsv));
}

export function hslToHsv(hsl: HSL): HSV
{
    const s = hsl.s * hsl.l <.5? hsl.l : 1- hsl.l;

    return {
        h: hsl.h,
        s: s * 2 / (hsl.l +s),
        v: hsl.l + s,
    };
}

export function hexToRgb(hex: string): RGB
{
    const [r, g, b] = hex.replace("#", "").match(/../g)!.map((x: string) => Number.parseInt(x, 16));

    return { r, g, b };
}

export function hsv2hsl(hsv: HSV): HSL
{
    const h = (2 - hsv.s) * hsv.v;

    return {
        h: hsv.h,
        s: hsv.s * hsv.v / ( h < 1 ? h : 2 - h),
        l: hsv.h / 2
    };
}

export function hslToRgb(hsl: HSL): RGB
{
    const h = range(hsl.h, 0, 1);
    const s = range(hsl.s, 0, 1);
    const l = range(hsl.l, 0, 1);

    if (s == 0)
    {
        const value = toFixed(l * 255);

        return { r: value, g: value, b: value };
    }

    const v2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
    const v1 = l * 2 - v2;

    const r = toFixed(hueToRgb(v1, v2, h + (1 / 3)) * 255, 0);
    const g = toFixed(hueToRgb(v1, v2, h) * 255, 0);
    const b = toFixed(hueToRgb(v1, v2, h - (1 / 3)) * 255, 0);

    return { r, g, b };
}

export function hsvToRgb(hsv: HSV): RGB
{
    const h = range(hsv.h, 0, 1);
    const s = range(hsv.s, 0, 1);
    const v = range(hsv.v, 0, 1);

    if (s == 0)
    {
        const value = toFixed(v * 255);

        return { r: value, g: value, b: value };
    }
    else
    {
        let hue = h * 6;

        if (hue == 6)
        {
            hue = 0;
        }

        let i = Math.floor(hue);

        const v0 = toFixed(v * 255);
        const v1 = toFixed(v * (1 - s) * 255);
        const v2 = toFixed(v * (1 - s * (hue - i)) * 255);
        const v3 = toFixed(v * (1 - s * (1 - (hue - i))) * 255);


        switch (i)
        {
            case 0:
                return { r: v0, g: v3, b: v1 };
            case 1:
                return { r: v2, g: v0, b: v1 };
            case 2:
                return { r: v1, g: v0, b: v3 };
            case 3:
                return { r: v1, g: v2, b: v0 };
            case 4:
                return { r: v3, g: v1, b: v0 };
            default:
                return { r: v0, g: v1, b: v2 };
        }
    }
}

export function labToXyz(lab: LAB): XYZ
{
    const y = (lab.l + 16) / 116;
    const x = lab.a / 500 + y;
    const z = y - lab.b / 200;

    return {
        x: labToXyzTransform(x) * ILLUMINANT_D65.X,
        y: labToXyzTransform(y) * ILLUMINANT_D65.Y,
        z: labToXyzTransform(z) * ILLUMINANT_D65.Z,
    };
}

export function rgbToHex(rgb: RGB): string
{
    return "#" + toFixed((rgb.r << 16) + (rgb.g << 8) + (rgb.b)).toString(16).padStart(6, "0");
}

export function rgbToHsl(rgb: RGB): HSL
{
    const r = range(rgb.r / 255, 0, 1);
    const g = range(rgb.g / 255, 0, 1);
    const b = range(rgb.b / 255, 0, 1);

    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);

    const chroma = max - min;

    const l = (max + min) / 2;

    if (chroma == 0)
    {
        return { h: 0, s: 0, l };
    }
    else
    {
        const s = l < 0.5 ? chroma / (max + min) : chroma / (2 - max - min);

        const h = rgbToHue(r, g, b, chroma, max);

        return { h, s, l };
    }
}

export function rgbToHsv(rgb: RGB): HSV
{
    const r = range(rgb.r / 255, 0, 1);
    const g = range(rgb.g / 255, 0, 1);
    const b = range(rgb.b / 255, 0, 1);

    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);

    const chroma = max - min;

    const v = max;

    if (chroma == 0)
    {
        return { h: 0, s: 0, v };
    }
    else
    {
        const s = chroma / max;

        const h = rgbToHue(r, g, b, chroma, max);

        return { h, s, v };
    }
}

export function rgbToXyz(rgb: RGB): XYZ
{
    const r = rgbToXyzTransform(range(rgb.r, 0, 255) / 255);
    const g = rgbToXyzTransform(range(rgb.g, 0, 255) / 255);
    const b = rgbToXyzTransform(range(rgb.b, 0, 255) / 255);

    return {
        x: r * 0.4124 + g * 0.3576 + b * 0.1805,
        y: r * 0.2126 + g * 0.7152 + b * 0.0722,
        z: r * 0.0193 + g * 0.1192 + b * 0.9505,
    };
}

export function xyzToLab(xyz: XYZ): LAB
{
    const x = xyzToLabTransform(xyz.x / ILLUMINANT_D65.X);
    const y = xyzToLabTransform(xyz.y / ILLUMINANT_D65.Y);
    const z = xyzToLabTransform(xyz.z / ILLUMINANT_D65.Z);

    return {
        l: (y * 116) - 16,
        a: (x - y) * 500,
        b: (y - z) * 200,
    };
}

export function xyzToRgb(xyz: XYZ): RGB
{
    const x = range(xyz.x, 0, ILLUMINANT_D65.Z) / 100;
    const y = range(xyz.y, 0, ILLUMINANT_D65.Y) / 100;
    const z = range(xyz.z, 0, ILLUMINANT_D65.Z) / 100;

    const r = toFixed(xyzToRgbTransform(x *  3.2406 + y * -1.5372 + z * -0.4986) * 255);
    const g = toFixed(xyzToRgbTransform(x * -0.9689 + y *  1.8758 + z *  0.0415) * 255);
    const b = toFixed(xyzToRgbTransform(x *  0.0557 + y * -0.2040 + z *  1.0570) * 255);

    return { r, g, b };
}