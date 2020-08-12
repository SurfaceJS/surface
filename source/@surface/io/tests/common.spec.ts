import fs                                                               from "fs";
import path                                                             from "path";
import { after, shouldFail, shouldPass, suite, test }                   from "@surface/test-suite";
import chai                                                             from "chai";
import { createPath, createPathAsync, lookUp, removePath, resolveFile } from "..";

@suite
export default class CommonSpec
{
    @after
    public cleanup(): void
    {
        removePath(path.resolve(__dirname, "fixtures"));
    }

    @test @shouldPass
    public makePath(): void
    {
        const pathToMake = path.resolve(__dirname, "./fixtures/deep/path/to/delete");

        createPath(pathToMake);

        chai.expect(fs.existsSync(pathToMake)).to.equal(true);
    }

    @test @shouldPass
    public async makePathAsync(): Promise<void>
    {
        const pathToMake = path.resolve(__dirname, "./fixtures/deep/path/to/delete");

        await createPathAsync(pathToMake);

        chai.expect(fs.existsSync(pathToMake)).to.equal(true);
    }

    @test @shouldPass
    public deletePath(): void
    {
        const pathToDelete = path.resolve(__dirname, "./fixtures/deep");

        removePath(pathToDelete);

        chai.expect(fs.existsSync(pathToDelete)).to.equal(false);
    }

    @test @shouldPass
    public deletePathWithFiles(): void
    {
        const pathToDelete = path.resolve(__dirname, "./fixtures/files");
        const pathToMake   = path.resolve(__dirname, "./fixtures/files/to/delete");

        createPath(pathToMake);

        fs.writeFileSync(path.join(pathToMake, "file-1.txt"), "delete me");
        fs.writeFileSync(path.join(pathToMake, "file-2.txt"), "delete me");

        chai.expect(removePath(pathToDelete)).to.equal(true);
        chai.expect(fs.existsSync(pathToDelete)).to.equal(false);
    }

    @test @shouldPass
    public deletePathWithSymbolicLink(): void
    {
        const realPath = path.resolve(__dirname, "./fixtures/real");
        const linkPath = path.resolve(__dirname, "./fixtures/link");

        fs.writeFileSync(realPath, "delete me");

        fs.symlinkSync(realPath, linkPath);

        chai.expect(removePath(linkPath)).to.equal(true);
        chai.expect(fs.existsSync(linkPath)).to.equal(false);
    }

    @test @shouldPass
    public deleteNonExistingPath(): void
    {
        chai.expect(removePath(path.resolve(__dirname, "./non/existing/path"))).to.equal(false);
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
        ].forEach(createPath);

        fs.writeFileSync(expected, "resolved");

        chai.expect(resolveFile(__dirname, paths)).to.equal(expected);
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
        ].forEach(createPath);

        fs.writeFileSync(expected, "resolved");

        chai.expect(resolveFile(__dirname, paths)).to.equal(expected);
    }

    @test @shouldPass
    public lookup(): void
    {
        const pathToLookup = path.resolve(__dirname, "./fixtures/path/to/lookup");
        const expected     = path.resolve(pathToLookup, "../../", "file.txt");

        createPath(pathToLookup);

        fs.writeFileSync(expected, "look for me");

        chai.expect(lookUp(pathToLookup, "file.txt")).to.equal(expected);
    }

    @test @shouldPass
    public lookupInvalidPath(): void
    {
        chai.expect(lookUp(__dirname, `invalid-file-path${Date.now()}`)).to.equal(null);
    }

    @test @shouldFail
    public makeInvalidPath(): void
    {
        const pathToMake = path.resolve(__dirname, "./fixtures/file");

        fs.writeFileSync(path.join(pathToMake), "delete me");
        chai.expect(() => createPath(path.join(pathToMake))).to.throw(Error, `${pathToMake} exist and isn't an directory`);
    }

    @test @shouldFail
    public async makeInvalidPathAsync(): Promise<void>
    {
        const pathToMake = path.resolve(__dirname, "./fixtures/file");

        fs.writeFileSync(path.join(pathToMake), "delete me");

        try
        {
            await createPathAsync(path.join(pathToMake));

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

        chai.expect(() => createPath(linkPath)).to.throw(Error, `${realPath} exist and isn't an directory`);
    }

    @test @shouldFail
    public cantResolveFile(): void
    {
        chai.expect(() => resolveFile(__dirname, ["./invalid/paht"])).to.throw(Error, "paths not found");
    }
}