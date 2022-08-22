import os                                   from "os";
import { join }                             from "path";
import type { PackageJson as _PackageJson } from "@npm/types";
import { timestamp } from "@surface/core";
import { LogLevel }                         from "@surface/logger";
import Status                               from "../internal/enums/status.js";
import type { Options }                     from "../internal/publisher.js";
import type Publisher                       from "../internal/publisher.js";
import type VirtualDirectory                from "./types/virtual-directory.js";

/* cSpell:ignore premajor, postpack */

type PackageJson = _PackageJson & { workspaces?: string[] };

const skip = false;

export type PublishScenario =
{
    skip:      boolean,
    message:   string,
    args:      Parameters<Publisher["publish"]>,
    options:   Options,
    directory: VirtualDirectory,
    registry:  Record<string, Status>,
    expected:  { published: string[] },
};

export const validScenarios: PublishScenario[] =
[
    {
        skip,
        message:   "Publish with no packages",
        options:   { },
        args:      ["latest"],
        registry:  { },
        directory: { },
        expected:  { published: [] },
    },
    {
        skip,
        message:   "Dry run publish single package",
        options:
        {
            dry: true,
        },
        args:      ["latest"],
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
        },
        expected:
        {
            published: [],
        },
    },
    {
        skip,
        message:   "Dry run publish single package with script",
        options:
        {
            dry: true,
        },
        args:      ["latest"],
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    scripts: { "postpack": "echo hello world!!!" },
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
        },
        expected:
        {
            published: [],
        },
    },
    {
        skip,
        message:   "Publish single package with script",
        options:   { },
        args:      ["latest"],
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    scripts: { "postpack": "echo hello world!!!" },
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
        },
        expected:
        {
            published: ["package-a@1.0.0"],
        },
    },
    {
        skip,
        message:   "Dry run publish workspaces",
        options:
        {
            dry: true,
        },
        args:      ["latest"],
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:       "package-root",
                    version:    "1.0.0",
                    workspaces: ["package-a"],
                } as Partial<PackageJson>,
            ),
            "./package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
        },
        expected:
        {
            published: [],
        },
    },
    {
        skip,
        message:  "Publish private package",
        options:  { },
        args:     ["latest"],
        registry:
        {
            "package-a": Status.InRegistry,
        },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    private: true,
                    name:    "package-a",
                    version: "0.0.1",
                } as Partial<PackageJson>,
            ),
        },
        expected:  { published: [] },
    },
    {
        skip,
        message:  "Publish package already in registry",
        options:  { },
        args:     ["latest", { registry: "https://test.com" }],
        registry:
        {
            "package-a": Status.InRegistry,
        },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "0.0.1",
                } as Partial<PackageJson>,
            ),
        },
        expected:  { published: [] },
    },
    {
        skip,
        message:   "Publish workspaces packages",
        options:   { },
        args:      ["latest"],
        registry:  { "package-b": Status.InRegistry },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:       "package-root",
                    version:    "1.0.0",
                    workspaces: ["packages/*"],
                } as Partial<PackageJson>,
            ),
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as Partial<PackageJson>,
                ),
                "./package-b/package.json": JSON.stringify
                (
                    {
                        name:    "package-b",
                        version: "0.1.0",
                    } as Partial<PackageJson>,
                ),
            },
        },
        expected:
        {
            published:
            [
                "package-a@0.0.1",
            ],
        },
    },
    {
        skip,
        message:   "Publish workspaces packages and include workspaces root",
        options:   {  },
        args:      ["latest", { includeWorkspaceRoot: true }],
        registry:  { "package-b": Status.InRegistry },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:       "package-root",
                    version:    "1.0.0",
                    workspaces: ["packages/*"],
                } as Partial<PackageJson>,
            ),
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as Partial<PackageJson>,
                ),
                "./package-b/package.json": JSON.stringify
                (
                    {
                        name:    "package-b",
                        version: "0.1.0",
                    } as Partial<PackageJson>,
                ),
            },
        },
        expected:
        {
            published:
            [
                "package-a@0.0.1",
                "package-root@1.0.0",
            ],
        },
    },
    {
        skip,
        message:   "Publish multiples packages with npmrc authentication",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        args:      ["latest"],
        registry:  { "package-b": Status.InRegistry },
        directory:
        {
            "./packages":
            {
                [join(os.homedir(), ".npmrc")]: "@lib:registry=https://test.com\n//test.com:_authToken=123",
                "./package-a/package.json":     JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as Partial<PackageJson>,
                ),
                "./package-a/.npmrc":       "registry=https://test.com\n_authToken=123",
                "./package-b/package.json": JSON.stringify
                (
                    {
                        name:    "@lib/package-b",
                        version: "0.1.0",
                    } as Partial<PackageJson>,
                ),
                "./package-b/.npmrc":       "@lib:registry=https://test.com\n//test.com:_authToken=123",
                "./package-c/package.json": JSON.stringify
                (
                    {
                        name:    "package-c",
                        version: "0.1.0",
                    } as Partial<PackageJson>,
                ),
                "./package-d/package.json": JSON.stringify
                (
                    {
                        name:    "@lib/package-d",
                        version: "0.1.0",
                    } as Partial<PackageJson>,
                ),
                "./package-e/package.json": JSON.stringify
                (
                    {
                        name:    "@other-lib/package-e",
                        version: "0.1.0",
                    } as Partial<PackageJson>,
                ),
            },
        },
        expected:
        {
            published:
            [
                "package-a@0.0.1",
                "@lib/package-b@0.1.0",
                "package-c@0.1.0",
                "@lib/package-d@0.1.0",
                "@other-lib/package-e@0.1.0",
            ],
        },
    },
    {
        skip,
        message:   "Publish multiples packages with dependency",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        args:      ["latest"],
        registry:  { },
        directory:
        {
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as Partial<PackageJson>,
                ),
                "./package-b/package.json": JSON.stringify
                (
                    {
                        name:         "package-b",
                        dependencies:
                        {
                            "package-a": "0.0.1",
                        },
                        version: "0.1.0",
                    } as Partial<PackageJson>,
                ),
            },
        },
        expected:
        {
            published:
            [
                "package-a@0.0.1",
                "package-b@0.1.0",
            ],
        },
    },
    {
        skip,
        message:   "Publish multiples packages with dependency and file reference",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        args:      ["latest"],
        registry:  { },
        directory:
        {
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as Partial<PackageJson>,
                ),
                "./package-b/package.json": JSON.stringify
                (
                    {
                        name:         "package-b",
                        dependencies:
                        {
                            "package-a": "file:../package-a",
                        },
                        version: "0.1.0",
                    } as Partial<PackageJson>,
                ),
            },
        },
        expected:
        {
            published:
            [
                "package-a@0.0.1",
                "package-b@0.1.0",
            ],
        },
    },
    {
        skip,
        message:   "Publish canary",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        args:      ["latest", { canary: true }],
        registry:  { },
        directory:
        {
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as Partial<PackageJson>,
                ),
                "./package-b/package.json": JSON.stringify
                (
                    {
                        name:         "package-b",
                        dependencies:
                        {
                            "package-a": "0.0.1",
                        },
                        version: "0.1.0",
                    } as Partial<PackageJson>,
                ),
            },
        },
        expected:
        {
            published:
            [
                `package-a@0.0.1-dev.${timestamp()}`,
                `package-b@0.1.0-dev.${timestamp()}`,
            ],
        },
    },
    {
        skip,
        message:   "Publish canary with prerelease type",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        args:      ["latest", { canary: true, prereleaseType: "premajor" }],
        registry:  { },
        directory:
        {
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as Partial<PackageJson>,
                ),
                "./package-b/package.json": JSON.stringify
                (
                    {
                        name:         "package-b",
                        dependencies:
                        {
                            "package-a": "0.0.1",
                        },
                        version: "0.1.0",
                    } as Partial<PackageJson>,
                ),
            },
        },
        expected:
        {
            published:
            [
                "package-a@1.0.0-0",
                "package-b@1.0.0-0",
            ],
        },
    },
    {
        skip,
        message:   "Publish canary with prerelease type and identifier",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        args:      ["latest", { canary: true, prereleaseType: "premajor", identifier: "dev" }],
        registry:  { },
        directory:
        {
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as Partial<PackageJson>,
                ),
                "./package-b/package.json": JSON.stringify
                (
                    {
                        name:         "package-b",
                        dependencies:
                        {
                            "package-a": "0.0.1",
                        },
                        version: "0.1.0",
                    } as Partial<PackageJson>,
                ),
            },
        },
        expected:
        {
            published:
            [
                "package-a@1.0.0-dev.0",
                "package-b@1.0.0-dev.0",
            ],
        },
    },
    {
        skip,
        message:   "Publish canary with prerelease type, identifier and sequence",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        args:      ["latest", { canary: true, prereleaseType: "premajor", identifier: "dev", sequence: "2022" }],
        registry:  { },
        directory:
        {
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as Partial<PackageJson>,
                ),
                "./package-b/package.json": JSON.stringify
                (
                    {
                        name:         "package-b",
                        dependencies:
                        {
                            "package-a": "0.0.1",
                        },
                        version: "0.1.0",
                    } as Partial<PackageJson>,
                ),
            },
        },
        expected:
        {
            published:
            [
                "package-a@1.0.0-dev.2022.0",
                "package-b@1.0.0-dev.2022.0",
            ],
        },
    },
    {
        skip,
        message:   "Publish canary with options",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        args:      ["latest", { canary: true, identifier: "dev", sequence: "2022.8.20" }],
        registry:  { },
        directory:
        {
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as Partial<PackageJson>,
                ),
                "./package-b/package.json": JSON.stringify
                (
                    {
                        name:         "package-b",
                        dependencies:
                        {
                            "package-a": "0.0.1",
                        },
                        version: "0.1.0",
                    } as Partial<PackageJson>,
                ),
            },
        },
        expected:
        {
            published:
            [
                "package-a@0.0.1-dev.2022.8.20",
                "package-b@0.1.0-dev.2022.8.20",
            ],
        },
    },
    {
        skip,
        message:   "Publish disabled canary with options",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        args:      ["latest", { canary: false, identifier: "dev", sequence: "2022.8.20" }],
        registry:  { },
        directory:
        {
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as Partial<PackageJson>,
                ),
                "./package-b/package.json": JSON.stringify
                (
                    {
                        name:         "package-b",
                        dependencies:
                        {
                            "package-a": "0.0.1",
                        },
                        version: "0.1.0",
                    } as Partial<PackageJson>,
                ),
            },
        },
        expected:
        {
            published:
            [
                "package-a@0.0.1",
                "package-b@0.1.0",
            ],
        },
    },
];
