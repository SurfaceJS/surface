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
export default class MainSpec
{
    @beforeEach
    public beforeEach(): void
    {
        CommandsMock.lock();

        CommandsMock.setup("bump")
            .call(It.any(), It.any(), It.any())
            .resolve();

        CommandsMock.setup("changed")
            .call(It.any(), It.any())
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
            "--tag=next",
            "--cwd=.",
            "--dry=true",
            "--ignore-changes=*.md",
            "--force=true",
            "--independent=true",
            "--log-level=trace",
            "--packages=bar",
            "--packages=foo",
            "--registry=https://registry.com",
            "--synchronize=true",
            "--token=123",
            "--update-file-references=true",
        ];

        let actual: Parameters<typeof Commands["bump"]> | undefined;
        const expected: DeepRequired<Parameters<typeof Commands["bump"]>> =
        [
            "prerelease",
            "alpha",
            {
                cwd:                  ".",
                tag:                  "next",
                dry:                  true,
                force:                true,
                ignoreChanges:        ["*.md"],
                independent:          true,
                logLevel:             LogLevel.Trace,
                packages:             ["bar", "foo"],
                registry:             "https://registry.com",
                synchronize:          true,
                token:                "123",
                updateFileReferences: true,
            },
        ];

        CommandsMock.setup("bump")
            .call(It.any(), It.any(), It.any())
            .callback((...args) => actual = args)
            .resolve();

        await chai.assert.isFulfilled(main(args));

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async changed(): Promise<void>
    {
        const args =
        [
            "",
            "",
            "changed",
            "latest",
            "--cwd=.",
            "--dry=true",
            "--ignore-changes=*.md",
            "--include-private=true",
            "--include-workspace-root=true",
            "--log-level=trace",
            "--packages=bar",
            "--packages=foo",
            "--registry=https://registry.com",
            "--token=123",
        ];

        let actual: Parameters<typeof Commands["changed"]> | undefined;
        const expected: DeepRequired<Parameters<typeof Commands["changed"]>> =
        [
            "latest",
            {
                cwd:                  ".",
                dry:                  true,
                ignoreChanges:        ["*.md"],
                includePrivate:       true,
                includeWorkspaceRoot: true,
                logLevel:             LogLevel.Trace,
                packages:             ["bar", "foo"],
                registry:             "https://registry.com",
                token:                "123",
            },
        ];

        CommandsMock.setup("changed")
            .call(It.any(), It.any())
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
            "--force=true",
            "--identifier=alpha",
            "--ignore-changes=*.md",
            "--include-private=true",
            "--include-workspace-root=true",
            "--log-level=trace",
            "--packages=bar",
            "--packages=foo",
            "--prerelease-type=premajor",
            "--registry=https://registry.com",
            "--synchronize=true",
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
                force:                true,
                identifier:           "alpha",
                ignoreChanges:        ["*.md"],
                includePrivate:       true,
                includeWorkspaceRoot: true,
                logLevel:             LogLevel.Trace,
                packages:             ["bar", "foo"],
                prereleaseType:       "premajor",
                registry:             "https://registry.com",
                synchronize:          true,
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
            "--packages=bar",
            "--packages=foo",
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
                packages:             ["bar", "foo"],
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
