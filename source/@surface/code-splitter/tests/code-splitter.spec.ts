import { shouldFail, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import CodeSplitter                from "..";

@suite
export default class CodeSplitterSpec
{
    @test @shouldFail
    public noOptions(): void
    {
        expect(() => CodeSplitter.execute()).to.throw(Error, "parameter \"options\" not specified");
    }

    @test @shouldFail
    public noContextOption(): void
    {
        expect(() => CodeSplitter.execute({ entries: [], output: "." })).to.throw(Error, "parameter \"options.context\" not specified");
    }

    @test @shouldFail
    public noEntriesOption(): void
    {
        expect(() => CodeSplitter.execute({ context: ".", output: "." })).to.throw(Error, "parameter \"options.entries\" not specified");
    }

    @test @shouldFail
    public noOutputOption(): void
    {
        expect(() => CodeSplitter.execute({ context: ".", entries: [] })).to.throw(Error, "parameter \"options.output\" not specified");
    }
}