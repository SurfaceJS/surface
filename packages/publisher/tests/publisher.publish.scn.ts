import os                                   from "os";
import { join }                             from "path";
import type { PackageJson as _PackageJson } from "@npm/types";
import type { ParameterOverloads }          from "@surface/core";
import { LogLevel }                         from "@surface/logger";
import Status                               from "../internal/enums/status.js";
import type { Options }                     from "../internal/publisher.js";
import type Publisher                       from "../internal/publisher.js";
import type VirtualDirectory                from "./types/virtual-directory.js";

type PackageJson = _PackageJson & { workspaces?: string[] };

const skip = false;

export type PublishScenario =
{
    skip:      boolean,
    message:   string,
    args:      ParameterOverloads<Publisher["publish"]>,
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
        message:   "Publish package already in registry",
        options:
        {
            registry: "https://test.com",
        },
        args:      ["latest"],
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
                "package-a",
            ],
        },
    },
    {
        skip,
        message:   "Publish workspaces packages and include workspaces root",
        options:   { includeWorkspaceRoot: true },
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
                "package-a",
                "package-root",
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
                "package-a",
                "@lib/package-b",
                "package-c",
                "@lib/package-d",
                "@other-lib/package-e",
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
                "package-a",
                "package-b",
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
                "package-a",
                "package-b",
            ],
        },
    },
];
