import Polygon from "@surface/3d-math/polygon";
import Vector3 from "@surface/3d-math/vector-3";
import { HSV } from "./converters";

const MAX_DISTANCE = 0.707107;

export type Swatch = { index: number, color: HSV };

function average(...values: Array<number>): number
{
    return values.reduce((a, b) => a + b) / values.length;
}

function lockValue(value: number, max: number): number
{
    return value < 0
        ? value + max
        : value > max
            ? value - max
            : value;
}

function colorFromVector(vector: Vector3): HSV
{
    return { h: vector.z, s: vector.x, v: vector.y };
}

function* intervalsIterator(index: number, targetIndex: number, target: Vector3, origin: Vector3): IterableIterator<Swatch>
{
    if (Vector3.equals(target, origin))
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

        const direction  = Vector3.subtract(target, origin);
        const distance   = Math.min(direction.magnitude, MAX_DISTANCE) / (offset + 1);
        const normalized = direction.normalized;

        for (let step = 1; step <= offset; step++)
        {
            const stepVector = Vector3.add(origin, Vector3.multiply(normalized, step * distance));

            yield { index, color: colorFromVector(stepVector) };

            index++;
        }
    }
}

function vectorFromColor(color: HSV): Vector3
{
    return new Vector3(color.s, color.v, color.h);
}

function* palleteIterator(swatches: Array<Swatch>, range?: { start: number, end: number }): IterableIterator<Swatch>
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

    const averageHue = average(...swatches.map(x => x.color.h));

    let index = range.start;

    let origin = new Vector3(0, 1, averageHue);

    for (const swatch of swatches)
    {
        if (swatch.index > range.end)
        {
            return;
        }

        const target = vectorFromColor(swatch.color);

        if (index < swatch.index)
        {
            for (const _node of intervalsIterator(index, swatch.index, target, origin))
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
        const target = new Vector3(origin.x, 0, averageHue);

        for (const _node of intervalsIterator(index, range.end + 1, target, origin))
        {
            yield _node;
        }
    }
}

export function generatePallete(swatches: Array<Swatch>, range?: { start: number, end: number }): Array<Swatch>
{
    return Array.from(palleteIterator(swatches, range));
}

export function palleteScale(swatches: Array<Swatch>, factor: number): Array<Swatch>
{
    const vertices = swatches.map(x => vectorFromColor(x.color));

    const height = lockValue(average(...vertices.map(x => x.z)) - 0.5, 1);

    const copy = [...swatches];

    return Polygon.scale(new Polygon(vertices), new Vector3(0.5, 0.5, height), factor).vertices
        .map((x, i) => ({ index: copy[i].index, color: colorFromVector(x) }));
}