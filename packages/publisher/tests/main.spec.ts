// cSpell:ignore premajor

import type { DeepRequired }                                          from "@surface/core";
import { LogLevel }                                                   from "@surface/logger";
import Mock, { It }                                                   from "@surface/mock";
import { afterEach, beforeEach, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert, use }                                                from "chai";
import chaiAsPromised                                                 from "chai-as-promised";
import Commands                                                       from "../internal/commands.js";
import main                                                           from "../internal/main.js";

use(chaiAsPromised);

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

        let actual: Parameters<typeof Commands["bump"]> | undefined;
        const expected: DeepRequired<Parameters<typeof Commands["bump"]>> =
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
            .callback((...args) => actual = args)
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

        let actual: Parameters<typeof Commands["changed"]> | undefined;
        const expected: DeepRequired<Parameters<typeof Commands["changed"]>> =
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
            .callback((...args) => actual = args)
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

        let actual: Parameters<typeof Commands["publish"]> | undefined;
        const expected: DeepRequired<Parameters<typeof Commands["publish"]>> =
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
            .callback((...args) => actual = args)
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

        let actual: Parameters<typeof Commands["unpublish"]> | undefined;
        const expected: DeepRequired<Parameters<typeof Commands["unpublish"]>> =
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
            .callback((...args) => actual = args)
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
