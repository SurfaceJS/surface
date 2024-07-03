import os                                   from "os";
import { join }                             from "path";
import type { PackageJson as _PackageJson } from "@npm/types";
import { LogLevel }                         from "@surface/logger";
import type { Options }                     from "../internal/publisher.js";
import type Publisher                       from "../internal/publisher.js";
import type VirtualDirectory                from "./types/virtual-directory.js";
import type VirtualRegistry                 from "./types/virtual-registry.js";

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
    registry:  VirtualRegistry,
    expected:  { published: string[] },
};

export const validPublishScenarios: PublishScenario[] =
[
    {
        skip,
        message:   "Publish with no packages",
        options:   { },
        args:      [],
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
        args:      [],
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
        args:      [],
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
        args:      [],
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
        args:      [],
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
        args:     [],
        registry:
        {
            "package-a": { isPublished: true, hasChanges: true },
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
        options:  { registry: "https://registry.com", token: "tokem" },
        args:     [],
        registry:
        {
            "package-a":
            {
                hasChanges: true,
                remote:
                {
                    latest:
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    },
                },
            },
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
        message:  "Publish force",
        options:  { token: "token" },
        args:     [{ force: true }],
        registry:
        {
            "package-a": { isPublished: true, hasChanges: true },
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
        expected:  { published: ["package-a@0.0.1"] },
    },
    {
        skip,
        message:  "Publish canary package already in registry",
        options:  { registry: "https://registry.com" },
        args:     [{ canary: true, build: "2022" }],
        registry:
        {
            "package-a":
            {
                hasChanges: true,
                remote:
                {
                    next:
                    {
                        name:    "package-a",
                        version: "0.0.1-dev.2022",
                    },
                },
            },
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
        args:      [],
        registry:
        {
            "package-b":
            {
                remote:
                {
                    latest:
                    {
                        name:    "package-b",
                        version: "0.1.0",
                    },
                },
                hasChanges:  true,
            },
        },
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
        message:   "Publish multiples packages with npmrc authentication",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        args:      [],
        registry:  { "package-b": { isPublished: true, hasChanges: true } },
        directory:
        {
            "./packages":
            {
                [join(os.homedir(), ".npmrc")]: "registry=https://global-registry.com\n_authToken=123\n@lib:registry=https://lib.com\n//lib.com:_authToken=123",
                "./package-a/.npmrc":           "registry=https://package-a-registry.com\n_authToken=123",
                "./package-a/package.json":     JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as Partial<PackageJson>,
                ),
                "./package-b/.npmrc":       "@lib:registry=https://package-b-registry.com\n//package-b-registry.com:_authToken=123",
                "./package-b/package.json": JSON.stringify
                (
                    {
                        name:    "@lib/package-b",
                        version: "0.1.0",
                    } as Partial<PackageJson>,
                ),
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
                "./package-e/.npmrc":       "",
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
        args:      [],
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
        args:      [],
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
        args:      [{ canary: true }],
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
                "package-a@0.0.1-dev.202201010000",
                "package-b@0.1.0-dev.202201010000",
            ],
        },
    },
    {
        skip,
        message:   "Publish canary with prerelease type, preid and build",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        args:      [{ canary: true, prereleaseType: "premajor", preid: "alpha", build: "2022" }],
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
                "package-a@1.0.0-alpha.0.2022",
                "package-b@1.0.0-alpha.0.2022",
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
        args:      [{ canary: false, preid: "dev" }],
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
