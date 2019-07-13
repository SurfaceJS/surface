import { shouldPass, suite, test } from "@surface/test-suite";
import * as chai                   from "chai";
import { format }                  from "../../common/string";

@suite
export default class CommonStringtSpec
{
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