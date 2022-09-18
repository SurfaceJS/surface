import { shouldPass, suite, test }              from "@surface/test-suite";
import chai                                     from "chai";
import { capture, captureAll, format, queryfy } from "../../internal/common/string.js";

@suite
export default class CommonStringSpec
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

        chai.assert.deepEqual(actual1, expected1);
        chai.assert.deepEqual(actual2, expected2);
        chai.assert.deepEqual(actual3, expected3);
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
            "Outer 1",
            "<tag two>",
            "Inner 2",
            "</tag>",
            "Outer 2",
            "<tag three>",
            "Inner 3",
            "</tag>",
            "End",
        ].join("");

        const expected =
        [
            ["Start<tag one>",      "Inner 1", "</tag>"],
            ["Outer 1<tag two>",   "Inner 2", "</tag>"],
            ["Outer 2<tag three>", "Inner 3", "</tag>End"],
        ];

        const actual = captureAll(source, /<.*?>/, /<\/.*?>/);

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public format(): void
    {
        const source  = { name: "Jon", ticket: 33 };
        const pattern = "Hi ${name}! Here your ticket, number: ${ticket}";

        const actual   = format(pattern, source);
        const expected = "Hi Jon! Here your ticket, number: 33";

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public queryfy(): void
    {
        const source =
        {
            array:
            [
                1,
                [1, 2],
                {
                    property: 1,
                },
            ],
            boolean: true,
            number:  1.5,
            object:
            {
                property:
                {
                    boolean: false,
                    number:  -1,
                    string:  "bar",
                },
            },
            string:    "foo",
            undefined,
        };

        const expected =
        [
            "array[0]=1",
            "array[1][0]=1",
            "array[1][1]=2",
            "array[2].property=1",
            "boolean=true",
            "number=1.5",
            "object.property.boolean=false",
            "object.property.number=-1",
            "object.property.string=bar",
            "string=foo",
        ].join("&");

        const actual = queryfy(source);

        chai.assert.equal(actual, expected);
    }
}
