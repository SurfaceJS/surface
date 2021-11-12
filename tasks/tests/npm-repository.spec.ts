import { writeFile }     from "fs/promises";
import path              from "path";
import { fileURLToPath } from "url";
import { suite, test }   from "@surface/test-suite";
import chai              from "chai";
import pack              from "libnpmpack";
import { paths }         from "../internal/common.js";
import NpmRepository     from "../internal/npm-repository.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

@suite
export default class NpmRepositorySpec
{
    @test
    public async get(): Promise<void>
    {
        const repository = new NpmRepository();

        const manifest = await repository.get("@surface/core1@latest");

        chai.assert.isNotEmpty(manifest);
    }

    @test
    public async getStatus(): Promise<void>
    {
        const repository = new NpmRepository();

        const manifest = await repository.get("@surface/core@latest");

        const status = await repository.getStatus(manifest!);

        chai.assert.equal(status, 2);
    }

    @test
    public async pack(): Promise<void>
    {
        const buffer = await pack(`${paths.packages.surface}/core`);

        await writeFile(path.join(dirname, "core.tar"), buffer);

        chai.assert.isNotEmpty(buffer);
    }
}
