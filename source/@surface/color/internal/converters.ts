/* eslint-disable sort-keys */
/* eslint-disable no-param-reassign */
/* eslint-disable max-statements-per-line */
// Reference: https://www.easyrgb.com/en/math.php

const ILLUMINANT_D65 = { X: 95.047, Y: 100, Z: 108.883 };

const deltaChannel      = (chroma: number, max: number) => (channel: number) => ((max - channel) / 6 + chroma / 2) / chroma;
const labToXyzTransform = (channel: number): number => channel ** 3 > 0.008856 ? channel ** 3 : (channel - 16 / 116) / 7.787;
const rgbToXyzTransform = (channel: number): number => (channel > 0.04045 ? ((channel + 0.055) / 1.055) ** 2.4 : channel / 12.92) * 100;
const xyzToLabTransform = (channel: number): number => channel > 0.008856 ? channel ** (1 / 3) : channel * 7.787 + 16 / 116;
const xyzToRgbTransform = (channel: number): number => channel > 0.0031308 ? channel ** (1 / 2.4) * 1.055 - 0.055 : channel / 12.92;

function hueToRgb(v1: number, v2: number, h: number): number
{
    if (h < 0) { h += 1; }
    if (h > 1) { h -= 1; }

    if (h * 6 < 1) { return v1 + (v2 - v1) * 6 * h; }
    if (h * 2 < 1) { return v2; }
    if (h * 3 < 2) { return v1 + (v2 - v1) * (2 / 3  - h) * 6; }

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
            ? 1 / 3 + delta(r) - delta(b)
            : b == max
                ? 2 / 3 + delta(g) - delta(r)
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

export type HSL  = { h: number, s: number, l: number };
export type HSLA = HSL & { a: number };
export type HSV  = { h: number, s: number, v: number };
export type HSVA = HSV & { a: number };
export type LAB  = { l: number, a: number, b: number };
export type RGB  = { r: number, g: number, b: number };
export type RGBA = RGB & { a: number };
export type XYZ  = { x: number, y: number, z: number };

export function hexToHsla(hex: string): HSLA
{
    return rgbaToHsla(hexToRgba(hex));
}

export function hexToHsva(hex: string): HSVA
{
    return rgbaToHsva(hexToRgba(hex));
}

export function hexToRgb(hex: string): RGB
{
    const [r, g, b] = hex.replace("#", "").match(/../g)!.map((x: string) => Number.parseInt(x, 16));

    return { r, g, b };
}

export function hexToRgba(hex: string): RGBA
{
    const [r, g, b, a = 255] = hex.replace("#", "").match(/../g)!.map((x: string) => Number.parseInt(x, 16));

    return { r, g, b, a };
}

export function hslaToHex(hsla: HSLA): string
{
    return rgbaToHex(hslaToRgba(hsla));
}

export function hslaToHsva(hsla: HSLA): HSVA
{
    const s = hsla.s * hsla.l < 0.5 ? hsla.l : 1 - hsla.l;

    return {
        h: hsla.h,
        s: s * 2 / (hsla.l + s),
        v: hsla.l + s,
        a: hsla.a,
    };
}

export function hslaToRgba(hsla: HSLA): RGBA
{
    const h = range(hsla.h, 0, 1);
    const s = range(hsla.s, 0, 1);
    const l = range(hsla.l, 0, 1);
    const a = toFixed(range(hsla.a, 0, 1) * 255);

    if (s == 0)
    {
        const value = toFixed(l * 255);

        return { r: value, g: value, b: value, a };
    }

    const v2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
    const v1 = l * 2 - v2;

    const r = toFixed(hueToRgb(v1, v2, h + 1 / 3) * 255, 0);
    const g = toFixed(hueToRgb(v1, v2, h) * 255, 0);
    const b = toFixed(hueToRgb(v1, v2, h - 1 / 3) * 255, 0);

    return { r, g, b, a };
}

export function hsvaToHex(hsva: HSVA): string
{
    return rgbaToHex(hsvaToRgba(hsva));
}

export function hsvaToHsl(hsva: HSVA): HSLA
{
    const h = (2 - hsva.s) * hsva.v;

    return {
        h: hsva.h,
        s: hsva.s * hsva.v / (h < 1 ? h : 2 - h),
        l: hsva.h / 2,
        a: hsva.a,
    };
}

export function hsvaToRgba(hsva: HSVA): RGBA
{
    const h = range(hsva.h, 0, 1);
    const s = range(hsva.s, 0, 1);
    const v = range(hsva.v, 0, 1);
    const a = toFixed(range(hsva.a, 0, 1) * 255);

    if (s == 0)
    {
        const value = toFixed(v * 255);

        return { r: value, g: value, b: value, a };
    }

    let hue = h * 6;

    if (hue == 6)
    {
        hue = 0;
    }

    const i = Math.floor(hue);

    const v0 = toFixed(v * 255);
    const v1 = toFixed(v * (1 - s) * 255);
    const v2 = toFixed(v * (1 - s * (hue - i)) * 255);
    const v3 = toFixed(v * (1 - s * (1 - (hue - i))) * 255);

    switch (i)
    {
        case 0:
            return { r: v0, g: v3, b: v1, a };
        case 1:
            return { r: v2, g: v0, b: v1, a };
        case 2:
            return { r: v1, g: v0, b: v3, a };
        case 3:
            return { r: v1, g: v2, b: v0, a };
        case 4:
            return { r: v3, g: v1, b: v0, a };
        default:
            return { r: v0, g: v1, b: v2, a };
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
    return `#${[rgb.r, rgb.g, rgb.b].map(x => x.toString(16).padStart(2, "0")).join("")}`;
}

export function rgbaToHex(rgba: RGBA): string
{
    return `#${[rgba.r, rgba.g, rgba.b, rgba.a].map(x => x.toString(16).padStart(2, "0")).join("")}`;
}

export function rgbaToHsla(rgba: RGBA): HSLA
{
    const r = range(rgba.r / 255, 0, 1);
    const g = range(rgba.g / 255, 0, 1);
    const b = range(rgba.b / 255, 0, 1);
    const a = range(rgba.a / 255, 0, 1);

    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);

    const chroma = max - min;

    const l = (max + min) / 2;

    if (chroma == 0)
    {
        return { h: 0, s: 0, l, a };
    }

    const s = l < 0.5 ? chroma / (max + min) : chroma / (2 - max - min);

    const h = rgbToHue(r, g, b, chroma, max);

    return { h, s, l, a };

}

export function rgbaToHsva(rgba: RGBA): HSVA
{
    const r = range(rgba.r / 255, 0, 1);
    const g = range(rgba.g / 255, 0, 1);
    const b = range(rgba.b / 255, 0, 1);
    const a = range(rgba.a / 255, 0, 1);

    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);

    const chroma = max - min;

    const v = max;

    if (chroma == 0)
    {
        return { h: 0, s: 0, v, a };
    }

    const s = chroma / max;

    const h = rgbToHue(r, g, b, chroma, max);

    return { h, s, v, a };

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
        l: y * 116 - 16,
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