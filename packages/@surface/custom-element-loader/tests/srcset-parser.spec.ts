import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import type { SrcSet }             from "../internal/srcset-parser.js";
import SrcSetParser                from "../internal/srcset-parser.js";

@suite
export default class SrcSetParserSpec
{
    @test @shouldPass
    public parse(): void
    {
        const expected: SrcSet[] =
        [
            {
                density: 1,
                height:  600,
                url:     "foo.800-600.png",
                width:   800,
            },
            {
                density: 2,
                height:  1080,
                url:     "foo.1920-1080.png",
                width:   1920,
            },
        ];

        const actual = SrcSetParser.parse("foo.800-600.png 800w 600h 1x, foo.1920-1080.png 1920w 1080h 2x");

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public stringify(): void
    {
        const expected = "foo.800-600.png 1x 600h 800w, foo.1920-1080.png 2x 1080h 1920w";
        const sources: SrcSet[] =
        [
            {
                density: 1,
                height:  600,
                url:     "foo.800-600.png",
                width:   800,
            },
            {
                density: 2,
                height:  1080,
                url:     "foo.1920-1080.png",
                width:   1920,
            },
        ];

        const actual = SrcSetParser.stringify(sources);

        chai.assert.deepEqual(actual, expected);
    }
}