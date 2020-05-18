import { shouldPass, suite, test }     from "@surface/test-suite";
import * as chai                       from "chai";
import { capture, captureAll, format } from "../../internal/common/string";

@suite
export default class CommonStringtSpec
{
    @test @shouldPass
    public capture(): void
    {
        const source1 = "<foo id='1'>Hello World!!!</foo>";
        const source2 = "text = \"This is a text\";";
        const source3 = "text = \"This is a \\\"text\\\" is escaped\";";

        const expected1 = ["<foo id='1'>", "Hello World!!!", "</foo>"];
        const expected2 = ["text = \"", "This is a text", "\";"];
        const expected3 = ["text = \"", "This is a \\\"text\\\" is escaped", "\";"];

        const actual1 = capture(source1, /<.*?>/, /<\/.*>/);
        const actual2 = capture(source2, /"/, /"/);
        const actual3 = capture(source3, /"/, /(")(?!.*\1)/);

        chai.expect(actual1).to.deep.equal(expected1);
        chai.expect(actual2).to.deep.equal(expected2);
        chai.expect(actual3).to.deep.equal(expected3);
    }

    @test @shouldPass
    public captureAll(): void
    {
        const source =
        [
            "Start",
            "<tag one>",
            "Inner 1",
            "</tag>",
            "Outter 1",
            "<tag two>",
            "Inner 2",
            "</tag>",
            "Outter 2",
            "<tag three>",
            "Inner 3",
            "</tag>",
            "End"
        ].join("");

        const expected =
        [
            ["Start<tag one>",      "Inner 1", "</tag>"],
            ["Outter 1<tag two>",   "Inner 2", "</tag>"],
            ["Outter 2<tag three>", "Inner 3", "</tag>End"]
        ];

        const actual = captureAll(source, /<.*?>/, /<\/.*?>/);

        chai.expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public format(): void
    {
        const source  = { name: "Jon", ticket: 33 };
        const pattern = "Hi ${name}! Here your ticket, number: ${ticket}";

        const actual   = format(pattern, source);
        const expected = "Hi Jon! Here your ticket, number: 33";

        chai.expect(actual).to.equal(expected);
    }
}