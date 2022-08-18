/* eslint-disable sort-keys */
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import { interpolateSwatches, scaleSwatches }  from "../internal/colors/swatches.js";
import type Swatch                             from "../internal/types/swatch";

@suite
export default class SwatchesSpec
{
    @test @shouldPass
    public generatePalletWithoutRange(): void
    {
        const swatches: Swatch[] =
        [
            { index: 1, color: { h: 0, s: 1, v: 1, a: 1 } },
            { index: 5, color: { h: 0, s: 1, v: 0, a: 1 } },
        ];

        const expected: Swatch[] =
        [
            { index: 1, color: { h: 0, s: 1, v: 1,                   a: 1 } },
            { index: 2, color: { h: 0, s: 1, v: 0.82322325,          a: 1 } },
            { index: 3, color: { h: 0, s: 1, v: 0.6464464999999999,  a: 1 } },
            { index: 4, color: { h: 0, s: 1, v: 0.46966975,          a: 1 } },
            { index: 5, color: { h: 0, s: 1, v: 0,                   a: 1 } },
        ];

        const actual = Array.from(interpolateSwatches(swatches));

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public generatePalletWithRangeAndSwatchAtStart(): void
    {
        const swatches: Swatch[] =
        [
            { index: 1, color: { h: 0, s: 1, v: 1, a: 1 } },
        ];

        const expected: Swatch[] =
        [
            { index: 1, color: { h: 0, s: 1, v: 1,                  a: 1 } },
            { index: 2, color: { h: 0, s: 1, v: 0.8585786,          a: 1 } },
            { index: 3, color: { h: 0, s: 1, v: 0.7171571999999999, a: 1 } },
            { index: 4, color: { h: 0, s: 1, v: 0.5757358,          a: 1 } },
            { index: 5, color: { h: 0, s: 1, v: 0.4343144,          a: 1 } },
        ];

        const actual = Array.from(interpolateSwatches(swatches, { start: 1, end: 5 }));

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public generatePalletWithRangeAndSwatchAtEnd(): void
    {
        const swatches: Swatch[] =
        [
            { index: 5, color: { h: 0, s: 1, v: 1, a: 1 } },
        ];

        const expected: Swatch[] =
        [
            { index: 1, color: { h: 0, s: 0.1414214, v: 1, a: 1 } },
            { index: 2, color: { h: 0, s: 0.2828428, v: 1, a: 1 } },
            { index: 3, color: { h: 0, s: 0.4242642, v: 1, a: 1 } },
            { index: 4, color: { h: 0, s: 0.5656856, v: 1, a: 1 } },
            { index: 5, color: { h: 0, s: 1,         v: 1, a: 1 } },
        ];

        const actual = Array.from(interpolateSwatches(swatches, { start: 1, end: 5 }));

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public generatePalletWithRangeAndSwatchAtCenter(): void
    {
        const swatches: Swatch[] =
        [
            { index: 4, color: { h: 0, s: 0.5, v: 0.5, a: 1 } },
        ];

        const expected: Swatch[] =
        [
            { index: 1, color: { h: 0, s: 0.125, v: 0.875, a: 1 } },
            { index: 2, color: { h: 0, s: 0.25,  v: 0.75,  a: 1 } },
            { index: 3, color: { h: 0, s: 0.375, v: 0.625, a: 1 } },
            { index: 4, color: { h: 0, s: 0.5,   v: 0.5,   a: 1 } },
            { index: 5, color: { h: 0, s: 0.5,   v: 0.375, a: 1 } },
            { index: 6, color: { h: 0, s: 0.5,   v: 0.25,  a: 1 } },
            { index: 7, color: { h: 0, s: 0.5,   v: 0.125, a: 1 } },
        ];

        const actual = Array.from(interpolateSwatches(swatches, { start: 1, end: 7 }));

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public generatePalletWithRangeAndSwatchAtStartAndEnd(): void
    {
        const swatches: Swatch[] =
        [
            { index: 1, color: { h: 0, s: 1, v: 1, a: 1 } },
            { index: 5, color: { h: 0, s: 1, v: 0, a: 1 } },
        ];

        const expected: Swatch[] =
        [
            { index: 1, color: { h: 0, s: 1, v: 1,                  a: 1 } },
            { index: 2, color: { h: 0, s: 1, v: 0.82322325,         a: 1 } },
            { index: 3, color: { h: 0, s: 1, v: 0.6464464999999999, a: 1 } },
            { index: 4, color: { h: 0, s: 1, v: 0.46966975,         a: 1 } },
            { index: 5, color: { h: 0, s: 1, v: 0,                  a: 1 } },
        ];

        const actual = Array.from(interpolateSwatches(swatches, { start: 1, end: 5 }));

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public generatePalletWithRangeAndSwatchRandom(): void
    {
        const swatches: Swatch[] =
        [
            { index: 3, color:  { h: 0.55, s: 0.25, v: 0.6,  a: 1 } },
            { index: 6, color:  { h: 0.15, s: 0.4,  v: 0.85, a: 1 } },
            { index: 9, color:  { h: 0.1,  s: 0.5,  v: 0.5,  a: 1 } },
            { index: 12, color: { h: 0,    s: 1,    v: 1,    a: 1 } },
            { index: 15, color: { h: 0.5,  s: 0.7,  v: 0.2,  a: 1 } },
        ];

        const expected: Swatch[] =
        [
            { index: 1,  color: { h: 0.3566666666666667,   s: 0.08333333333333333, v: 0.8666666666666667,   a: 1 } },
            { index: 2,  color: { h: 0.45333333333333337,  s: 0.16666666666666666, v: 0.7333333333333333,   a: 1 } },
            { index: 3,  color: { h: 0.55,                 s: 0.25,                v: 0.6,                  a: 1 } },
            { index: 4,  color: { h: 0.41666666666666674,  s: 0.3,                 v: 0.6833333333333333,   a: 1 } },
            { index: 5,  color: { h: 0.2833333333333334,   s: 0.35000000000000003, v: 0.7666666666666666,   a: 1 } },
            { index: 6,  color: { h: 0.15,                 s: 0.4,                 v: 0.85,                 a: 1 } },
            { index: 7,  color: { h: 0.13333333333333333,  s: 0.43333333333333335, v: 0.7333333333333333,   a: 1 } },
            { index: 8,  color: { h: 0.11666666666666667,  s: 0.4666666666666667,  v: 0.6166666666666667,   a: 1 } },
            { index: 9,  color: { h: 0.1,                  s: 0.5,                 v: 0.5,                  a: 1 } },
            { index: 10, color: { h: 0.0669950716874402,   s: 0.665024641562799,   v: 0.665024641562799,    a: 1 } },
            { index: 11, color: { h: 0.033990143374880405, s: 0.830049283125598,   v: 0.830049283125598,    a: 1 } },
            { index: 12, color: { h: 0,                    s: 1,                   v: 1,                    a: 1 } },
            { index: 13, color: { h: 0.11904765588678,     s: 0.928571406467932,   v: 0.809523750581152,    a: 1 } },
            { index: 14, color: { h: 0.23809531177356,     s: 0.857142812935864,   v: 0.619047501162304,    a: 1 } },
            { index: 15, color: { h: 0.5,                  s: 0.7,                 v: 0.2,                  a: 1 } },
            { index: 16, color: { h: 0.42,                 s: 0.7,                 v: 0.13333333333333336,  a: 1 } },
            { index: 17, color: { h: 0.33999999999999997,  s: 0.7,                 v: 0.06666666666666668,  a: 1 } },
        ];

        const actual = Array.from(interpolateSwatches(swatches, { start: 1, end: 17 }));

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public palletScale(): void
    {
        const swatches: Swatch[] =
        [
            { index: 1, color: { h: 1, s: 1, v: 1, a: 1 } },
            { index: 5, color: { h: 1, s: 1, v: 0, a: 1 } },
        ];

        const expected: Swatch[] =
        [
            { index: 1, color: { h: 0.75, s: 0.75, v: 0.75, a: 1 } },
            { index: 5, color: { h: 0.75, s: 0.75, v: 0.25, a: 1 } },
        ];

        const actual = scaleSwatches(swatches, 0.5);

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public emptySwatches(): void
    {
        chai.assert.throw(() => interpolateSwatches([]));
    }

    @test @shouldFail
    public invalidRange(): void
    {
        chai.assert.throw(() => interpolateSwatches([], { start: 10, end: 1 }));
    }
}
