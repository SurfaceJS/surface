import { shouldFail, shouldPass, suite, test }   from "@surface/test-suite";
import { assert }                                from "chai";
import { generatePallete, palleteScale, Swatch } from "../internal/palletes";

@suite
export default class PalleteSpec
{
    @test @shouldPass
    public generatePalleteWithoutRange(): void
    {
        const swatches: Array<Swatch> =
        [
            { index: 1, color: { h: 0, s: 1, v: 1 }},
            { index: 5, color: { h: 0, s: 1, v: 0 }},
        ];

        const expected: Array<Swatch> =
        [
            { index: 1, color: { h: 0, s: 1, v: 1    }},
            { index: 2, color: { h: 0, s: 1, v: 0.75 }},
            { index: 3, color: { h: 0, s: 1, v: 0.5  }},
            { index: 4, color: { h: 0, s: 1, v: 0.25 }},
            { index: 5, color: { h: 0, s: 1, v: 0    }},
        ];

        const actual = Array.from(generatePallete(swatches));

        assert.deepEqual(actual, expected);
    }


    @test @shouldPass
    public generatePalleteWithRangeAndSwatchAtStart(): void
    {
        const swatches: Array<Swatch> =
        [
            { index: 1, color: { h: 0, s: 1, v: 1 }},
        ];

        const expected: Array<Swatch> =
        [
            { index: 1, color: { h: 0, s: 1, v: 1                   }},
            { index: 2, color: { h: 0, s: 1, v: 0.8                 }},
            { index: 3, color: { h: 0, s: 1, v: 0.6                 }},
            { index: 4, color: { h: 0, s: 1, v: 0.3999999999999999  }},
            { index: 5, color: { h: 0, s: 1, v: 0.19999999999999996 }},
        ];

        const actual = Array.from(generatePallete(swatches, { start: 1, end: 5 }));

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public generatePalleteWithRangeAndSwatchAtEnd(): void
    {
        const swatches: Array<Swatch> =
        [
            { index: 5, color: { h: 0, s: 1, v: 1 }},
        ];

        const expected: Array<Swatch> =
        [
            { index: 1, color: { h: 0, s: 0.2,                v: 1 }},
            { index: 2, color: { h: 0, s: 0.4,                v: 1 }},
            { index: 3, color: { h: 0, s: 0.6000000000000001, v: 1 }},
            { index: 4, color: { h: 0, s: 0.8,                v: 1 }},
            { index: 5, color: { h: 0, s: 1,                  v: 1 }},
        ];

        const actual = Array.from(generatePallete(swatches, { start: 1, end: 5 }));

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public generatePalleteWithRangeAndSwatchAtCenter(): void
    {
        const swatches: Array<Swatch> =
        [
            { index: 4, color: { h: 0, s: 0.5, v: 0.5 }},
        ];

        const expected: Array<Swatch> =
        [
            { index: 1, color: { h: 0, s: 0.125, v: 0.875 }},
            { index: 2, color: { h: 0, s: 0.25,  v: 0.75 }},
            { index: 3, color: { h: 0, s: 0.375, v: 0.625 }},
            { index: 4, color: { h: 0, s: 0.5,   v: 0.5 }},
            { index: 5, color: { h: 0, s: 0.5,   v: 0.375 }},
            { index: 6, color: { h: 0, s: 0.5,   v: 0.25 }},
            { index: 7, color: { h: 0, s: 0.5,   v: 0.125 }},
        ];

        const actual = Array.from(generatePallete(swatches, { start: 1, end: 7 }));

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public generatePalleteWithRangeAndSwatchAtStartAndEnd(): void
    {
        const swatches: Array<Swatch> =
        [
            { index: 1, color: { h: 0, s: 1, v: 1 }},
            { index: 5, color: { h: 0, s: 1, v: 0 }},
        ];

        const expected: Array<Swatch> =
        [
            { index: 1, color: { h: 0, s: 1, v: 1    }},
            { index: 2, color: { h: 0, s: 1, v: 0.75 }},
            { index: 3, color: { h: 0, s: 1, v: 0.5  }},
            { index: 4, color: { h: 0, s: 1, v: 0.25 }},
            { index: 5, color: { h: 0, s: 1, v: 0    }},
        ];

        const actual = Array.from(generatePallete(swatches, { start: 1, end: 5 }));

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public generatePalleteWithRangeAndSwatchRandom(): void
    {
        const swatches: Array<Swatch> =
        [
            { index: 3, color:  { h: 0.55, s: 0.25, v: 0.6 }},
            { index: 6, color:  { h: 0.15, s: 0.4,  v: 0.85 }},
            { index: 9, color:  { h: 0.1,  s: 0.5,  v: 0.5 }},
            { index: 12, color: { h: 0,    s: 1,    v: 1 }},
            { index: 15, color: { h: 0.5,  s: 0.7,  v: 0.2 }},
        ];

        const expected: Array<Swatch> =
        [
            { index: 1,  color: { h: 0.3566666666666667,  s: 0.08333333333333333, v: 0.8666666666666667  }},
            { index: 2,  color: { h: 0.45333333333333337, s: 0.16666666666666666, v: 0.7333333333333333  }},
            { index: 3,  color: { h: 0.55,                s: 0.25,                v: 0.6                 }},
            { index: 4,  color: { h: 0.41666666666666674, s: 0.3,                 v: 0.6833333333333333  }},
            { index: 5,  color: { h: 0.2833333333333334,  s: 0.35000000000000003, v: 0.7666666666666666  }},
            { index: 6,  color: { h: 0.15,                s: 0.4,                v: 0.85                 }},
            { index: 7,  color: { h: 0.13333333333333333, s: 0.43333333333333335, v: 0.7333333333333333  }},
            { index: 8,  color: { h: 0.11666666666666667, s: 0.4666666666666667,  v: 0.6166666666666667  }},
            { index: 9,  color: { h: 0.1,                 s: 0.5,                 v: 0.5                 }},
            { index: 10, color: { h: 0.06666666666666668, s: 0.6666666666666666,  v: 0.6666666666666666  }},
            { index: 11, color: { h: 0.03333333333333334, s: 0.8333333333333333,  v: 0.8333333333333333  }},
            { index: 12, color: { h: 0,                   s: 1,                   v: 1                   }},
            { index: 13, color: { h: 0.16666666666666666, s: 0.9,                 v: 0.7333333333333334  }},
            { index: 14, color: { h: 0.3333333333333333,  s: 0.7999999999999999,  v: 0.4666666666666667  }},
            { index: 15, color: { h: 0.5,                 s: 0.7,                 v: 0.2                 }},
            { index: 16, color: { h: 0.42,                s: 0.7,                 v: 0.13333333333333336 }},
            { index: 17, color: { h: 0.33999999999999997, s: 0.7,                 v: 0.06666666666666668 }},
        ];

        const actual = Array.from(generatePallete(swatches, { start: 1, end: 17 }));

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public palleteScale(): void
    {
        const swatches: Array<Swatch> =
        [
            { index: 1, color: { h: 1, s: 1, v: 1 }},
            { index: 5, color: { h: 1, s: 1, v: 0 }},
        ];

        const expected: Array<Swatch> =
        [
            { index: 1, color: { h: 0.75, s: 0.75, v: 0.75 }},
            { index: 5, color: { h: 0.75, s: 0.75, v: 0.25 }},
        ];

        const actual = palleteScale(swatches, 0.5);

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public emptySwatches(): void
    {
        assert.throw(() => generatePallete([]));
    }

    @test @shouldFail
    public invalidRange(): void
    {
        assert.throw(() => generatePallete([], { start: 10, end: 1 }));
    }
}