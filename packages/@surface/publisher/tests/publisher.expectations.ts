import type { ParameterOverloads }       from "@surface/core";
import { LogLevel }                      from "@surface/logger";
import type { Manifest, ManifestResult } from "pacote";
import type { Options }                  from "../internal/publisher.js";
import type Publisher                    from "../internal/publisher.js";

const skip = false;

export type VirtualFile      = { content: string | object };
export type VirtualDirectory = { [key: `./${string}`]: string | VirtualDirectory };

export type Scenario =
{
    message:   string,
    options:   Options,
    directory: VirtualDirectory,
    registry:  Record<string, ManifestResult>,
    expected:  Record<string, Partial<Manifest>>,
    bumpArgs:  ParameterOverloads<Publisher["bump"]>,
    skip:      boolean,
};

export const validScenarios: Scenario[] =
[
    {
        message:   "Bump with no updates",
        options:   { },
        registry:  { },
        directory: { },
        expected:  { },
        bumpArgs:  ["major"],
        skip,
    },
    {
        message:   "Bump with multiples updates",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        bumpArgs:  ["minor"],
        registry:
        {
            "package-a@latest": { version: "0.0.1" } as ManifestResult,
            "package-b@latest": { version: "0.0.1" } as ManifestResult,
            "package-c@latest": { version: "0.0.1" } as ManifestResult,
            "package-d@latest": { version: "0.0.1" } as ManifestResult,
        },
        directory:
        {
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as Partial<Manifest>,
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
                    } as Partial<Manifest>,
                ),
                "./package-c/package.json": JSON.stringify
                (
                    {
                        name:         "package-c",
                        dependencies:
                        {
                            "package-a": "file:../package-a",
                        },
                        devDependencies:
                        {
                            "package-b": "file:../package-b",
                        },
                        version: "1.0.0",
                    } as Partial<Manifest>,
                ),
                "./package-d/package.json": JSON.stringify
                (
                    {
                        name:         "package-d",
                        dependencies:
                        {
                            "package-a": "file:../package-a",
                        },
                        devDependencies:
                        {
                            "package-b": "file:../package-b",
                        },
                        peerDependencies:
                        {
                            "package-c": "file:../package-c",
                        },
                        version: "1.0.1",
                    } as Partial<Manifest>,
                ),
            },
        },
        expected:
        {
            "package-a":
            {
                name:    "package-a",
                version: "0.1.0",
            },
            "package-b":
            {
                name:         "package-b",
                dependencies:
                {
                    "package-a": "~0.1.0",
                },
                version: "0.2.0",
            },
            "package-c":
            {
                name:         "package-c",
                dependencies:
                {
                    "package-a": "~0.1.0",
                },
                devDependencies:
                {
                    "package-b": "~0.2.0",
                },
                version: "1.1.0",
            },
            "package-d":
            {
                name:         "package-d",
                dependencies:
                {
                    "package-a": "~0.1.0",
                },
                devDependencies:
                {
                    "package-b": "~0.2.0",
                },
                peerDependencies:
                {
                    "package-c": "~1.1.0",
                },
                version: "1.1.0",
            },
        },
        skip,
    },
    {
        message:   "Bump prerelease",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        bumpArgs:  ["prerelease", "alpha"],
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
                    } as Partial<Manifest>,
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
                    } as Partial<Manifest>,
                ),
                "./package-c/package.json": JSON.stringify
                (
                    {
                        name:         "package-c",
                        dependencies:
                        {
                            "package-a": "file:../package-a",
                        },
                        devDependencies:
                        {
                            "package-b": "file:../package-b",
                        },
                        version: "1.0.0",
                    } as Partial<Manifest>,
                ),
                "./package-d/package.json": JSON.stringify
                (
                    {
                        name:         "package-d",
                        dependencies:
                        {
                            "package-a": "file:../package-a",
                        },
                        devDependencies:
                        {
                            "package-b": "file:../package-b",
                        },
                        peerDependencies:
                        {
                            "package-c": "file:../package-c",
                        },
                        version: "1.0.1",
                    } as Partial<Manifest>,
                ),
            },
        },
        expected:
        {
            "package-a":
            {
                name:    "package-a",
                version: "0.0.2-alpha.0",
            },
            "package-b":
            {
                name:         "package-b",
                dependencies:
                {
                    "package-a": "~0.0.2-alpha.0",
                },
                version: "0.1.1-alpha.0",
            },
            "package-c":
            {
                name:         "package-c",
                dependencies:
                {
                    "package-a": "~0.0.2-alpha.0",
                },
                devDependencies:
                {
                    "package-b": "~0.1.1-alpha.0",
                },
                version: "1.0.1-alpha.0",
            },
            "package-d":
            {
                name:         "package-d",
                dependencies:
                {
                    "package-a": "~0.0.2-alpha.0",
                },
                devDependencies:
                {
                    "package-b": "~0.1.1-alpha.0",
                },
                peerDependencies:
                {
                    "package-c": "~1.0.1-alpha.0",
                },
                version: "1.0.2-alpha.0",
            },
        },
        skip,
    },
    {
        message:   "Bump prerelease",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        bumpArgs:  ["custom", "1.0.0-alpha"],
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
                    } as Partial<Manifest>,
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
                    } as Partial<Manifest>,
                ),
                "./package-c/package.json": JSON.stringify
                (
                    {
                        name:         "package-c",
                        dependencies:
                        {
                            "package-a": "file:../package-a",
                        },
                        devDependencies:
                        {
                            "package-b": "file:../package-b",
                        },
                        version: "1.0.0",
                    } as Partial<Manifest>,
                ),
                "./package-d/package.json": JSON.stringify
                (
                    {
                        name:         "package-d",
                        dependencies:
                        {
                            "package-a": "file:../package-a",
                        },
                        devDependencies:
                        {
                            "package-b": "file:../package-b",
                        },
                        peerDependencies:
                        {
                            "package-c": "file:../package-c",
                        },
                        version: "1.0.1",
                    } as Partial<Manifest>,
                ),
            },
        },
        expected:
        {
            "package-a":
            {
                name:    "package-a",
                version: "1.0.0-alpha",
            },
            "package-b":
            {
                name:         "package-b",
                dependencies:
                {
                    "package-a": "~1.0.0-alpha",
                },
                version: "1.0.0-alpha",
            },
            "package-c":
            {
                name:         "package-c",
                dependencies:
                {
                    "package-a": "~1.0.0-alpha",
                },
                devDependencies:
                {
                    "package-b": "~1.0.0-alpha",
                },
                version: "1.0.0-alpha",
            },
            "package-d":
            {
                name:         "package-d",
                dependencies:
                {
                    "package-a": "~1.0.0-alpha",
                },
                devDependencies:
                {
                    "package-b": "~1.0.0-alpha",
                },
                peerDependencies:
                {
                    "package-c": "~1.0.0-alpha",
                },
                version: "1.0.0-alpha",
            },
        },
        skip: false,
    },
    {
        message:   "Bump with glob prerelease",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        bumpArgs:  ["custom", "*-dev+2022.5"],
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
                    } as Partial<Manifest>,
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
                    } as Partial<Manifest>,
                ),
                "./package-c/package.json": JSON.stringify
                (
                    {
                        name:         "package-c",
                        dependencies:
                        {
                            "package-a": "file:../package-a",
                        },
                        devDependencies:
                        {
                            "package-b": "file:../package-b",
                        },
                        version: "1.0.0",
                    } as Partial<Manifest>,
                ),
                "./package-d/package.json": JSON.stringify
                (
                    {
                        name:         "package-d",
                        dependencies:
                        {
                            "package-a": "file:../package-a",
                        },
                        devDependencies:
                        {
                            "package-b": "file:../package-b",
                        },
                        peerDependencies:
                        {
                            "package-c": "file:../package-c",
                        },
                        version: "1.0.1",
                    } as Partial<Manifest>,
                ),
            },
        },
        expected:
        {
            "package-a":
            {
                name:    "package-a",
                version: "0.0.1-dev+2022.5",
            },
            "package-b":
            {
                name:         "package-b",
                dependencies:
                {
                    "package-a": "~0.0.1-dev+2022.5",
                },
                version: "0.1.0-dev+2022.5",
            },
            "package-c":
            {
                name:         "package-c",
                dependencies:
                {
                    "package-a": "~0.0.1-dev+2022.5",
                },
                devDependencies:
                {
                    "package-b": "~0.1.0-dev+2022.5",
                },
                version: "1.0.0-dev+2022.5",
            },
            "package-d":
            {
                name:         "package-d",
                dependencies:
                {
                    "package-a": "~0.0.1-dev+2022.5",
                },
                devDependencies:
                {
                    "package-b": "~0.1.0-dev+2022.5",
                },
                peerDependencies:
                {
                    "package-c": "~1.0.0-dev+2022.5",
                },
                version: "1.0.1-dev+2022.5",
            },
        },
        skip,
    },
];

export const invalidScenarios: Scenario[] =
[];