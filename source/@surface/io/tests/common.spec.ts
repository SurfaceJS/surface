import fs                                                              from "fs";
import path                                                            from "path";
import { after, shouldFail, shouldPass, suite, test }                  from "@surface/test-suite";
import chai                                                            from "chai";
import { createPath, createPathAsync, lookup, lookupFile, removePath } from "..";

@suite
export default class CommonSpec
{
    @after
    public cleanup(): void
    {
        removePath(path.resolve(__dirname, "fixtures"));
    }

    @test @shouldPass
    public createPath(): void
    {
        const pathToMake = path.resolve(__dirname, "./fixtures/deep/path/to/delete");

        createPath(pathToMake);

        chai.expect(fs.existsSync(pathToMake)).to.equal(true);
    }

    @test @shouldPass
    public async createPathAsync(): Promise<void>
    {
        const pathToMake = path.resolve(__dirname, "./fixtures/deep/path/to/delete");

        await createPathAsync(pathToMake);

        chai.expect(fs.existsSync(pathToMake)).to.equal(true);
    }

    @test @shouldPass
    public removePath(): void
    {
        const pathToDelete = path.resolve(__dirname, "./fixtures/deep");

        removePath(pathToDelete);

        chai.expect(fs.existsSync(pathToDelete)).to.equal(false);
    }

    @test @shouldPass
    public removePathWithFiles(): void
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
    public removePathWithSymbolicLink(): void
    {
        const realPath = path.resolve(__dirname, "./fixtures/real");
        const linkPath = path.resolve(__dirname, "./fixtures/link");

        fs.writeFileSync(realPath, "delete me");

        fs.symlinkSync(realPath, linkPath);

        chai.expect(removePath(linkPath)).to.equal(true);
        chai.expect(fs.existsSync(linkPath)).to.equal(false);
    }

    @test @shouldPass
    public removePathWithNoExistingPath(): void
    {
        chai.expect(removePath(path.resolve(__dirname, "./non/existing/path"))).to.equal(false);
    }

    @test @shouldPass
    public lookupFileRelativePath(): void
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

        chai.expect(lookupFile(__dirname, paths)).to.equal(expected);
    }

    @test @shouldPass
    public lookupFileAbsolutePath(): void
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

        chai.expect(lookupFile(__dirname, paths)).to.equal(expected);
    }

    @test @shouldFail
    public lookupFileWithInvalidPath(): void
    {
        chai.expect(lookupFile(__dirname, ["./invalid/path"])).to.equal(null);
    }

    @test @shouldPass
    public lookup(): void
    {
        const pathToLookup = path.resolve(__dirname, "./fixtures/path/to/lookup");
        const expected     = path.resolve(pathToLookup, "../../", "file.txt");

        createPath(pathToLookup);

        fs.writeFileSync(expected, "look for me");

        chai.expect(lookup(pathToLookup, "file.txt")).to.equal(expected);
    }

    @test @shouldPass
    public lookupWithInvalidPath(): void
    {
        chai.expect(lookup(__dirname, `invalid-file-path${Date.now()}`)).to.equal(null);
    }

    @test @shouldFail
    public createPathWithInvalidPath(): void
    {
        const pathToMake = path.resolve(__dirname, "./fixtures/file");

        fs.writeFileSync(path.join(pathToMake), "delete me");
        chai.expect(() => createPath(path.join(pathToMake))).to.throw(Error, `${pathToMake} exist and isn't an directory`);
    }

    @test @shouldFail
    public async createPathAsyncWithInvalidPath(): Promise<void>
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

    @test @shouldFail
    public createPathWithSymbolicLink(): void
    {
        const realPath = path.resolve(__dirname, "./fixtures/real");
        const linkPath = path.resolve(__dirname, "./fixtures/link");

        fs.writeFileSync(realPath, "delete me");

        fs.symlinkSync(realPath, linkPath);

        chai.expect(() => createPath(linkPath)).to.throw(Error, `${realPath} exist and isn't an directory`);
    }
}