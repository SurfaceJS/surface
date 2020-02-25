import Vector4  from "@surface/3d-math/vector-4";
import { HSVA } from "./converters";

const MAX_DISTANCE = 0.707107;

export type Swatch = { index: number, color: HSVA };

function average(...values: Array<number>): number
{
    return values.reduce((a, b) => a + b) / values.length;
}

function colorFromVector(vector: Vector4): HSVA
{
    return { h: vector.z, s: vector.x, v: vector.y, a: vector.w };
}

function* enumerateInterpolation(swatches: Array<Swatch>, range?: { start: number, end: number }): IterableIterator<Swatch>
{
    if (swatches.length == 0 || (swatches.length < 2 && !range))
    {
        throw new Error("Expected at least two swatches when not using range");
    }

    range = range ?? { start: swatches[0].index, end: swatches[swatches.length - 1].index };

    if (range.start > range.end)
    {
        throw new Error("Start range cannot be greater than end range");
    }

    const averageHue   = average(...swatches.map(x => x.color.h));
    const averageAlpha = average(...swatches.map(x => x.color.a));

    let index = range.start;

    let origin = new Vector4(0, 1, averageHue, averageAlpha);

    for (const swatch of swatches)
    {
        if (swatch.index > range.end)
        {
            return;
        }

        const target = vectorFromColor(swatch.color);

        if (index < swatch.index)
        {
            for (const _node of enumerateIntervals(index, swatch.index, target, origin))
            {
                yield _node;
            }

            index = swatch.index;
        }

        origin = target;

        yield swatch;

        index++;
    }

    if (index <= range.end)
    {
        const target = new Vector4(origin.x, 0, averageHue, 1);

        for (const _node of enumerateIntervals(index, range.end + 1, target, origin))
        {
            yield _node;
        }
    }
}

function* enumerateIntervals(index: number, targetIndex: number, target: Vector4, origin: Vector4): IterableIterator<Swatch>
{
    if (Vector4.equals(target, origin))
    {
        const color = colorFromVector(target);

        for (let i = index; i < targetIndex; i++)
        {
            yield { index: i, color };
        }
    }
    else
    {
        const offset = targetIndex - index;

        const direction  = Vector4.subtract(target, origin);
        const distance   = Math.min(direction.magnitude, MAX_DISTANCE) / (offset + 1);
        const normalized = direction.normalized;

        for (let step = 1; step <= offset; step++)
        {
            const stepVector = Vector4.add(origin, Vector4.multiply(normalized, step * distance));

            yield { index, color: colorFromVector(stepVector) };

            index++;
        }
    }
}

function lockValue(value: number, max: number): number
{
    return value < 0
        ? value + max
        : value > max
            ? value - max
            : value;
}

function vectorFromColor(color: HSVA): Vector4
{
    return new Vector4(color.s, color.v, color.h, color.a);
}

export function interpolateSwatches(swatches: Array<Swatch>, range?: { start: number, end: number }): Array<Swatch>
{
    return Array.from(enumerateInterpolation(swatches, range));
}

export function scaleSwatches(swatches: Array<Swatch>, factor: number): Array<Swatch>
{
    const vertices = swatches.map(x => vectorFromColor(x.color));

    const height = lockValue(average(...vertices.map(x => x.z)) - 0.5, 1);
    const alpha  = average(...vertices.map(x => x.w));

    const origin = new Vector4(0.5, 0.5, height, alpha);

    return vertices.map
    (
        (vertice, index) =>
        {
            const direction  = Vector4.subtract(vertice, origin);
            const distance   = direction.magnitude * factor;
            const normalized = direction.normalized;

            const color = colorFromVector(Vector4.add(origin, Vector4.multiply(normalized, distance)));

            return { index: swatches[index].index, color };
        }
    );
}