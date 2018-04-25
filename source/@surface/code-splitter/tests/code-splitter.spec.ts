import { deletePath, makePath }                        from "@surface/common";
import { before, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                                      from "chai";
import fs                                              from "fs";
import path                                            from "path";
import CodeSplitter                                    from "..";

@suite
export default class CodeSplitterSpec
{
    @before
    public before(): void
    {
        process.chdir(__dirname);

        const actual = path.resolve(__dirname, "./fixtures/actual");

        deletePath(actual);
        makePath(actual);
    }

    @test @shouldPass
    public emitDefault(): void
    {
        CodeSplitter.execute({ context: "./fixtures", entries: ["./js-modules"], output: "./actual/emit-js" });

        const actual   = fs.readFileSync(path.resolve(__dirname, "./fixtures/actual/emit-js.js")).toString();
        const expected = fs.readFileSync(path.resolve(__dirname, "./fixtures/expected/emit-js.js")).toString();

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public contextWithAbsolutePath(): void
    {
        CodeSplitter.execute({ context: path.resolve(__dirname, "./fixtures"), entries: ["./js-modules"], output: "./actual/emit-js" });

        const actual   = fs.readFileSync(path.resolve(__dirname, "./fixtures/actual/emit-js.js")).toString();
        const expected = fs.readFileSync(path.resolve(__dirname, "./fixtures/expected/emit-js.js")).toString();

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public emitTs(): void
    {
        CodeSplitter.execute({ context: "./fixtures", entries: ["./ts-modules"], output: "./actual/emit-ts.ts" });

        const actual   = fs.readFileSync(path.resolve(__dirname, "./fixtures/actual/emit-ts.ts")).toString();
        const expected = fs.readFileSync(path.resolve(__dirname, "./fixtures/expected/emit-ts.ts")).toString();

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public emitJs(): void
    {
        CodeSplitter.execute({ context: "./fixtures", entries: ["./js-modules"], output: "./actual/emit-js.js" });

        const actual   = fs.readFileSync(path.resolve(__dirname, "./fixtures/actual/emit-js.js")).toString();
        const expected = fs.readFileSync(path.resolve(__dirname, "./fixtures/expected/emit-js.js")).toString();

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public emitFileEntry(): void
    {
        CodeSplitter.execute({ context: "./fixtures", entries: ["./ts-modules/module-a.ts"], output: "./actual/single-entry.ts" });

        const actual   = fs.readFileSync(path.resolve(__dirname, "./fixtures/actual/single-entry.ts")).toString();
        const expected = fs.readFileSync(path.resolve(__dirname, "./fixtures/expected/single-entry.ts")).toString();

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public emitMultiplesEntries(): void
    {
        CodeSplitter.execute({ context: "./fixtures", entries: ["./ts-modules", "./ts-modules/deeper-modules"], output: "./actual/emit-multiples-entries.ts" });

        const actual   = fs.readFileSync(path.resolve(__dirname, "./fixtures/actual/emit-multiples-entries.ts")).toString();
        const expected = fs.readFileSync(path.resolve(__dirname, "./fixtures/expected/emit-multiples-entries.ts")).toString();

        expect(actual).to.deep.equal(expected);
    }

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

    @test @shouldFail
    public invalidEntry(): void
    {
        const options = { context: "./fixtures", entries: ["./ts-modules_"], output: "./actual/emit-ts.ts" };
        expect(() => CodeSplitter.execute(options)).to.throw(Error, `entry ${path.resolve(__dirname, "fixtures/./ts-modules_")} path not exists`);
    }
}