// cSpell:ignore premajor

import type { DeepRequired }                                          from "@surface/core";
import { LogLevel }                                                   from "@surface/logger";
import Mock, { It }                                                   from "@surface/mock";
import { afterEach, beforeEach, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                                           from "chai";
import chaiAsPromised                                                 from "chai-as-promised";
import Commands                                                       from "../internal/commands.js";
import main                                                           from "../internal/main.js";

chai.use(chaiAsPromised);

const CommandsMock = Mock.of(Commands);

@suite
export default class CreateProgramSpec
{
    @beforeEach
    public beforeEach(): void
    {
        CommandsMock.lock();

        CommandsMock.setup("bump")
            .call(It.any(), It.any(), It.any())
            .resolve();

        CommandsMock.setup("publish")
            .call(It.any(), It.any())
            .resolve();

        CommandsMock.setup("unpublish")
            .call(It.any(), It.any())
            .resolve();
    }

    @afterEach
    public afterEach(): void
    {
        CommandsMock.release();
    }

    @test @shouldPass
    public async bump(): Promise<void>
    {
        const args =
        [
            "",
            "",
            "bump",
            "prerelease",
            "alpha",
            "--cwd=.",
            "--dry=true",
            "--include-private=true",
            "--independent=true",
            "--packages=foo",
            "--packages=bar",
            "--synchronize=true",
            "--update-file-references=true",
            "--log-level=trace",
        ];

        let actual: Parameters<typeof Commands["bump"]> | undefined;
        const expected: DeepRequired<Parameters<typeof Commands["bump"]>> =
        [
            "prerelease",
            "alpha",
            {
                cwd:                  ".",
                dry:                  true,
                includePrivate:       true,
                independent:          true,
                logLevel:             LogLevel.Trace,
                packages:             ["foo", "bar"],
                synchronize:          true,
                updateFileReferences: true,
            },
        ];

        CommandsMock.setup("bump")
            .call(It.any(), It.any(), It.any())
            .callback((...args) => actual = args)
            .resolve();

        CommandsMock.setup("bump")
            .call(It.any(), It.any(), It.any())
            .callback((...args) => actual = args)
            .resolve();

        await chai.assert.isFulfilled(main(args));

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async publish(): Promise<void>
    {
        const args =
        [
            "",
            "",
            "publish",
            "latest",
            "--canary=true",
            "--cwd=.",
            "--dry=true",
            "--identifier=alpha",
            "--include-private=true",
            "--include-workspace-root=true",
            "--log-level=trace",
            "--packages=foo",
            "--packages=bar",
            "--prerelease-type=premajor",
            "--registry=https://registry.com",
            "--sequence=12345",
            "--token=token",
        ];

        let actual: Parameters<typeof Commands["publish"]> | undefined;
        const expected: DeepRequired<Parameters<typeof Commands["publish"]>> =
        [
            "latest",
            {
                canary:               true,
                cwd:                  ".",
                dry:                  true,
                identifier:           "alpha",
                includePrivate:       true,
                includeWorkspaceRoot: true,
                logLevel:             LogLevel.Trace,
                packages:             ["foo", "bar"],
                prereleaseType:       "premajor",
                registry:             "https://registry.com",
                sequence:             "12345",
                token:                "token",
            },
        ];

        CommandsMock.setup("publish")
            .call(It.any(), It.any())
            .callback((...args) => actual = args)
            .resolve();

        await chai.assert.isFulfilled(main(args));

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async unpublish(): Promise<void>
    {
        const args =
        [
            "",
            "",
            "unpublish",
            "latest",
            "--cwd=.",
            "--dry=true",
            "--include-private=true",
            "--include-workspace-root=true",
            "--log-level=trace",
            "--packages=foo",
            "--packages=bar",
            "--registry=https://registry.com",
            "--token=token",
        ];

        let actual: Parameters<typeof Commands["unpublish"]> | undefined;
        const expected: DeepRequired<Parameters<typeof Commands["unpublish"]>> =
        [
            "latest",
            {
                cwd:                  ".",
                dry:                  true,
                includePrivate:       true,
                includeWorkspaceRoot: true,
                logLevel:             LogLevel.Trace,
                packages:             ["foo", "bar"],
                registry:             "https://registry.com",
                token:                "token",
            },
        ];

        CommandsMock.setup("unpublish")
            .call(It.any(), It.any())
            .callback((...args) => actual = args)
            .resolve();

        await chai.assert.isFulfilled(main(args));

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async bumpWithInvalidSemanticVersion(): Promise<void>
    {
        await chai.assert.isRejected(main(["", "", "bump", "a.b.c"]));
        await chai.assert.isRejected(main(["", "", "bump", "invalid"]));
    }

    @test @shouldFail
    public async publishWitInvalidPrereleaseType(): Promise<void>
    {
        await chai.assert.isRejected(main(["", "", "publish", "latest", "--prerelease-type=major"]));
    }
}
