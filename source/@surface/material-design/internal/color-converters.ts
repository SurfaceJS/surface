// Reference: https://www.easyrgb.com/en/math.php

export type HSL = { h: number, s: number, l: number };
export type LAB = { l: number, a: number, b: number };
export type RGB = { r: number, g: number, b: number };
export type XYZ = { x: number, y: number, z: number };

const ILLUMINANT_D65 = { X: 95.047, Y: 100, Z: 108.883 };

export function hueToRgb(v1: number, v2: number, h: number): number
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


/** returns the value to a fixed number of digits */
function toFixed(value: number, digits?: number): number
{
    return Number.parseFloat(value.toFixed(digits ?? 0));
}

export function cielabToXyz(lab: LAB): XYZ
{
    const transform = (value: number) => value ** 3 > 0.008856 ? value ** 3 : (value - 16 / 116) / 7.787;

    const y = (lab.l + 16) / 116;
    const x = lab.a / 500 + y;
    const z = y - lab.b / 200;

    return {
        x: toFixed(transform(x) * ILLUMINANT_D65.X, 3),
        y: toFixed(transform(y) * ILLUMINANT_D65.Y, 3),
        z: toFixed(transform(z) * ILLUMINANT_D65.Z, 3),
    };
}

export function hslToRgb(hsl: HSL): RGB
{
    const h = range(hsl.h, 0, 360);
    const s = range(hsl.s, 0, 1);
    const l = range(hsl.l, 0, 1);

    if (s == 0)
    {
        const value = l * 255;

        return { r: value, g: value, b: value };
    }

    const v2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
    const v1 = l * 2 - v2;

    const hue = h / 360;

    const r = toFixed(hueToRgb(v1, v2, hue + (1 / 3)) * 255, 0);
    const g = toFixed(hueToRgb(v1, v2, hue) * 255, 0);
    const b = toFixed(hueToRgb(v1, v2, hue - (1 / 3)) * 255, 0);

    return { r, g, b };
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

        let h = r == max
            ? (g - b) / chroma
            : g == max
                ? (b - r) / chroma + 2
                : b == max
                    ? (r - g) / chroma + 4
                    : 0;

        h = h * 60;

        if (h < 0)
        {
            h += 360;
        }

        return { h: toFixed(h, 0), s: toFixed(s, 1), l: toFixed(l, 1) };
    }
}

export function rgbToXyz(rgb: RGB): XYZ
{
    const transform = (value: number) => (value > 0.04045 ? ((value + 0.055) / 1.055) ** 2.4 : value / 12.92) * 100;

    const r = transform(range(rgb.r, 0, 255) / 255);
    const g = transform(range(rgb.g, 0, 255) / 255);
    const b = transform(range(rgb.b, 0, 255) / 255);

    return {
        x: toFixed(r * 0.4124 + g * 0.3576 + b * 0.1805, 3),
        y: toFixed(r * 0.2126 + g * 0.7152 + b * 0.0722, 3),
        z: toFixed(r * 0.0193 + g * 0.1192 + b * 0.9505, 3),
    };
}

export function xyzToCielab(xyz: XYZ): LAB
{
    const transform = (value: number) => value > 0.008856 ? value ** (1 / 3) : (value * 7.787) + (16 / 116);

    const x = transform(xyz.x / ILLUMINANT_D65.X);
    const y = transform(xyz.y / ILLUMINANT_D65.Y);
    const z = transform(xyz.z / ILLUMINANT_D65.Z);

    return {
        l: toFixed((y * 116) - 16, 4),
        a: toFixed((x - y) * 500,  4),
        b: toFixed((y - z) * 200,  4),
    };
}

export function xyzToRgb(xyz: XYZ): RGB
{
    const transform = (value: number) => value > 0.0031308 ? (value ** (1 / 2.4)) * 1.055 - 0.055 : value / 12.92;

    const x = range(xyz.x, 0, ILLUMINANT_D65.Z) / 100;
    const y = range(xyz.y, 0, ILLUMINANT_D65.Y) / 100;
    const z = range(xyz.z, 0, ILLUMINANT_D65.Z) / 100;

    const r = toFixed(transform(x *  3.2406 + y * -1.5372 + z * -0.4986) * 255);
    const g = toFixed(transform(x * -0.9689 + y *  1.8758 + z *  0.0415) * 255);
    const b = toFixed(transform(x *  0.0557 + y * -0.2040 + z *  1.0570) * 255);

    return { r, g, b };
}