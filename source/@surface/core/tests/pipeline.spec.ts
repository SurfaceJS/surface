import { suite, test }                  from "@surface/test-suite";
import chai                             from "chai";
import { camelToText, format, toTitle } from "../common/string";
import Pipeline                         from "../pipeline";

@suite
export default class PipelineSepc
{
    @test
    public pipe(): void
    {
        const value = Pipeline
            .from("hello${name}")
            .pipe(x => format(x, { name: "World" }))
            .pipe(camelToText)
            .pipe(toTitle)
            .pipe(x => `${x}!!!`)
            .value();

        chai.expect(value).to.equal("Hello World!!!");
    }
}