import { after, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                           from "chai";
import fs                                             from "fs";
import path                                           from "path";
import * as common                                    from "..";

@suite
export default class CommonSpec
{
    @after
    public cleanup(): void
    {
        common.deletePath(path.resolve(__dirname, "fixtures"));
    }

    @test @shouldPass
    public makePath(): void
    {
        const pathToMake = path.resolve(__dirname, "./fixtures/deep/path/to/delete");

        common.makePath(pathToMake);

        chai.expect(fs.existsSync(pathToMake)).to.equal(true);
    }

    @test @shouldPass
    public async makePathAsync(): Promise<void>
    {
        const pathToMake = path.resolve(__dirname, "./fixtures/deep/path/to/delete");

        await common.makePathAsync(pathToMake);

        chai.expect(fs.existsSync(pathToMake)).to.equal(true);
    }

    @test @shouldPass
    public deletePath(): void
    {
        const pathToDelete = path.resolve(__dirname, "./fixtures/deep");

        common.deletePath(pathToDelete);

        chai.expect(fs.existsSync(pathToDelete)).to.equal(false);
    }

    @test @shouldPass
    public deletePathWithFiles(): void
    {
        const pathToDelete = path.resolve(__dirname, "./fixtures/files");
        const pathToMake   = path.resolve(__dirname, "./fixtures/files/to/delete");

        common.makePath(pathToMake);

        fs.writeFileSync(path.join(pathToMake, "file-1.txt"), "delete me");
        fs.writeFileSync(path.join(pathToMake, "file-2.txt"), "delete me");

        chai.expect(common.deletePath(pathToDelete)).to.equal(true);
        chai.expect(fs.existsSync(pathToDelete)).to.equal(false);
    }

    @test @shouldPass
    public deletePathWithSymboliLink(): void
    {
        const realPath = path.resolve(__dirname, "./fixtures/real");
        const linkPath = path.resolve(__dirname, "./fixtures/link");

        fs.writeFileSync(realPath, "delete me");

        fs.symlinkSync(realPath, linkPath);

        chai.expect(common.deletePath(linkPath)).to.equal(true);
        chai.expect(fs.existsSync(linkPath)).to.equal(false);
    }

    @test @shouldPass
    public deleteNonExistingPath(): void
    {
        chai.expect(common.deletePath(path.resolve(__dirname, "./non/existing/path"))).to.equal(false);
    }

    @test @shouldPass
    public resolveRelativeFile(): void
    {
        const expected = path.resolve(__dirname, "./fixtures/path/to/resolve-3/file.txt");

        const paths =
        [
            "./fixtures/path/to/resolve-1/file.txt",
            "./fixtures/path/to/resolve-2/file.txt",
            "./fixtures/path/to/resolve-3/file.txt",
        ];

        [
            path.join(__dirname, "./fixtures/path/to/resolve-1"),
            path.join(__dirname, "./fixtures/path/to/resolve-2"),
            path.join(__dirname, "./fixtures/path/to/resolve-3"),
        ]
        .forEach(common.makePath);

        fs.writeFileSync(expected, "resolved");

        chai.expect(common.resolveFile(__dirname, paths)).to.equal(expected);
    }

    @test @shouldPass
    public resolveAbsoluteFile(): void
    {
        const expected = path.resolve(__dirname, "./fixtures/path/to/resolve-3/file.txt");

        const paths =
        [
            "./fixtures/path/to/resolve-1/file.txt",
            "./fixtures/path/to/resolve-2/file.txt",
            path.join(__dirname, "./fixtures/path/to/resolve-3/file.txt"),
        ];

        [
            path.join(__dirname, "./fixtures/path/to/resolve-1"),
            path.join(__dirname, "./fixtures/path/to/resolve-2"),
            path.join(__dirname, "./fixtures/path/to/resolve-3"),
        ]
        .forEach(common.makePath);

        fs.writeFileSync(expected, "resolved");

        chai.expect(common.resolveFile(__dirname, paths)).to.equal(expected);
    }

    @test @shouldPass
    public lookup(): void
    {
        const pathToLookup = path.resolve(__dirname, "./fixtures/path/to/lookup");
        const expected     = path.resolve(pathToLookup, "../../", "file.txt");

        common.makePath(pathToLookup);

        fs.writeFileSync(expected, "look for me");

        chai.expect(common.lookUp(pathToLookup, "file.txt")).to.equal(expected);
    }

    @test @shouldPass
    public lookupInvalidPath(): void
    {
        chai.expect(common.lookUp(__dirname, `invalid-file-path${Date.now()}`)).to.equal(null);
    }

    @test @shouldPass
    public mergeObjects(): void
    {
        const target = { a: 1, b: "2", c: { a: 1, c: { a: 1, b: 2 } }, e: { }, h: { }};
        const source = { c: { b: true, c: { a: 2, c: 3 }}, e: 1, f: [1], g: { }, i: undefined, h: undefined };

        const actual = common.merge(target, source);

        const expect = { a: 1, b: "2", c: { a: 1, b: true, c: { a: 2, b: 2, c: 3}}, e: 1, f: [1], g: { }, h: { }};

        chai.expect(actual).to.deep.equal(expect);
    }

    @test @shouldPass
    public mergeCombineArrays(): void
    {
        const target = { values: [1, 2, 3] };
        const source = { values: [4, 5, 6] };

        const actual = common.merge(target, source, true);

        const expect = { values: [1, 2, 3, 4, 5, 6] };

        chai.expect(actual).to.deep.equal(expect);
    }

    @test @shouldPass
    public mergeCombineMutiplesObjects(): void
    {
        const target = { a: 1, b: "2", c: { d: 3 }};
        const source = [{ c: { e: true }}, { f: [1], g: { }}];

        const actual = common.merge(target, source);

        const expect = { a: 1, b: "2", c: { d: 3, e: true }, f: [1], g: { }};

        chai.expect(actual).to.deep.equal(expect);
    }

    @test @shouldFail
    public makeInvalidPath(): void
    {
        const pathToMake = path.resolve(__dirname, "./fixtures/file");

        fs.writeFileSync(path.join(pathToMake), "delete me");
        chai.expect(() => common.makePath(path.join(pathToMake))).to.throw(Error, `${pathToMake} exist and isn't an directory`);
    }

    @test @shouldFail
    public async makeInvalidPathAsync(): Promise<void>
    {
        const pathToMake = path.resolve(__dirname, "./fixtures/file");

        fs.writeFileSync(path.join(pathToMake), "delete me");

        try
        {
            await common.makePathAsync(path.join(pathToMake));

        }
        catch (error)
        {
            chai.expect(error).to.includes(new Error(`${pathToMake} exist and isn't an directory`));
        }
    }

    @test @shouldPass
    public makePathReadingSymbolicLink(): void
    {
        const realPath = path.resolve(__dirname, "./fixtures/real");
        const linkPath = path.resolve(__dirname, "./fixtures/link");

        fs.writeFileSync(realPath, "delete me");

        fs.symlinkSync(realPath, linkPath);

        chai.expect(() => common.makePath(linkPath)).to.throw(Error, `${realPath} exist and isn't an directory`);
    }

    @test @shouldFail
    public cantResolveFile(): void
    {
        chai.expect(() => common.resolveFile(__dirname, ["./invalid/paht"])).to.throw(Error, "paths not found");
    }
}