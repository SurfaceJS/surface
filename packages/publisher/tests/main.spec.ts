// cSpell:ignore premajor

import type { DeepRequired }                                          from "@surface/core";
import { LogLevel }                                                   from "@surface/logger";
import Mock, { It }                                                   from "@surface/mock";
import { afterEach, assert, beforeEach, shouldFail, shouldPass, suite, test } from "@surface/test-suite";

const CommandsMock = Mock.instance<{
    bump:      (version: string, preid?: string, build?: string, options?: object) => Promise<void>;
    changed:   (options?: object) => Promise<void>;
    publish:   (options?: object) => Promise<void>;
    unpublish: (options?: object) => Promise<void>;
}>();

type BumpArgs      = [string, string?, string?, object?];
type ChangedArgs   = [object?];
type PublishArgs   = [object?];
type UnpublishArgs = [object?];

Mock.module(
    import.meta.resolve("../internal/commands.js"),
    {
        defaultExport: CommandsMock.proxy,
    },
);

const { default: main } = await import("../internal/main.js");

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
            .call(It.any())
            .resolve();

        CommandsMock.setup("publish")
            .call(It.any())
            .resolve();

        CommandsMock.setup("unpublish")
            .call(It.any())
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
            "2022",
            "--changelog=true",
            "--commit=true",
            "--create-release=github",
            "--cwd=.",
            "--dry=true",
            "--force=true",
            "--ignore-changes=*.md",
            "--independent=true",
            "--log-level=trace",
            "--packages=bar",
            "--packages=foo",
            "--push-to-remote=true",
            "--registry=https://registry.com",
            "--remote=origin",
            "--synchronize=true",
            "--tag=next",
            "--token=123",
            "--update-file-references=true",
            "--include-private=true",
        ];

        let actual: BumpArgs | undefined;
        const expected: DeepRequired<BumpArgs> =
        [
            "prerelease",
            "alpha",
            "2022",
            {
                changelog:            true,
                commit:               true,
                createRelease:        "github",
                cwd:                  ".",
                dry:                  true,
                force:                true,
                ignoreChanges:        ["*.md"],
                independent:          true,
                logLevel:             LogLevel.Trace,
                packages:             ["bar", "foo"],
                pushToRemote:         true,
                registry:             "https://registry.com",
                remote:               "origin",
                synchronize:          true,
                tag:                  "next",
                token:                "123",
                updateFileReferences: true,
                includePrivate:       true,
            },
        ];

        CommandsMock.setup("bump")
            .call(It.any(), It.any(), It.any(), It.any())
            .callback((...args) => actual = args as BumpArgs)
            .resolve();

        await assert.isFulfilled(main(args));

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async changed(): Promise<void>
    {
        const args =
        [
            "",
            "",
            "changed",
            "--cwd=.",
            "--dry=true",
            "--ignore-changes=*.md",
            "--include-private=true",
            "--log-level=trace",
            "--packages=bar",
            "--packages=foo",
            "--registry=https://registry.com",
            "--tag=latest",
            "--token=123",
        ];

        let actual: ChangedArgs | undefined;
        const expected: DeepRequired<ChangedArgs> =
        [
            {
                cwd:            ".",
                dry:            true,
                ignoreChanges:  ["*.md"],
                includePrivate: true,
                logLevel:       LogLevel.Trace,
                packages:       ["bar", "foo"],
                registry:       "https://registry.com",
                token:          "123",
                tag:            "latest",
            },
        ];

        CommandsMock.setup("changed")
            .call(It.any())
            .callback((...args) => actual = args as ChangedArgs)
            .resolve();

        await assert.isFulfilled(main(args));

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async publish(): Promise<void>
    {
        const args =
        [
            "",
            "",
            "publish",
            "--build=2022",
            "--canary=true",
            "--cwd=.",
            "--dry=true",
            "--force=true",
            "--preid=alpha",
            "--ignore-changes=*.md",
            "--include-private=true",
            "--log-level=trace",
            "--packages=bar",
            "--packages=foo",
            "--prerelease-type=premajor",
            "--registry=https://registry.com",
            "--synchronize=true",
            "--tag=latest",
            "--token=token",
        ];

        let actual: PublishArgs | undefined;
        const expected: DeepRequired<PublishArgs> =
        [
            {
                build:          "2022",
                canary:         true,
                cwd:            ".",
                dry:            true,
                force:          true,
                ignoreChanges:  ["*.md"],
                includePrivate: true,
                logLevel:       LogLevel.Trace,
                packages:       ["bar", "foo"],
                preid:          "alpha",
                prereleaseType: "premajor",
                registry:       "https://registry.com",
                synchronize:    true,
                tag:            "latest",
                token:          "token",
            },
        ];

        CommandsMock.setup("publish")
            .call(It.any())
            .callback((...args) => actual = args as PublishArgs)
            .resolve();

        await assert.isFulfilled(main(args));

        assert.deepEqual(actual, expected);
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
            "--log-level=trace",
            "--packages=bar",
            "--packages=foo",
            "--registry=https://registry.com",
            "--token=token",
        ];

        let actual: UnpublishArgs | undefined;
        const expected: DeepRequired<UnpublishArgs> =
        [
            {
                cwd:            ".",
                dry:            true,
                includePrivate: true,
                logLevel:       LogLevel.Trace,
                packages:       ["bar", "foo"],
                registry:       "https://registry.com",
                token:          "token",
            },
        ];

        CommandsMock.setup("unpublish")
            .call(It.any())
            .callback((...args) => actual = args as UnpublishArgs)
            .resolve();

        await assert.isFulfilled(main(args));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async bumpWithInvalidSemanticVersion(): Promise<void>
    {
        await assert.isRejected(main(["", "", "bump", "a.b.c"]));
        await assert.isRejected(main(["", "", "bump", "invalid"]));
    }

    @test @shouldFail
    public async publishWitInvalidPrereleaseType(): Promise<void>
    {
        await assert.isRejected(main(["", "", "publish", "latest", "--prerelease-type=major"]));
    }
}