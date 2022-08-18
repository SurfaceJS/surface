import type { ParameterOverloads } from "@surface/core";
import { LogLevel }                from "@surface/logger";
import type { Manifest }           from "pacote";
import type { Options }            from "../internal/publisher.js";
import type Publisher              from "../internal/publisher.js";
import type VirtualDirectory       from "./types/virtual-directory";

const skip = false;

export type BumpScenario =
{
    skip:      boolean,
    message:   string,
    options:   Options,
    directory: VirtualDirectory,
    expected:  Record<string, Partial<Manifest>>,
    bumpArgs:  ParameterOverloads<Publisher["bump"]>,
};

export const validScenarios: BumpScenario[] =
[
    {

        skip,
        message:   "Bump with no updates",
        options:   { },
        directory: { },
        expected:  { },
        bumpArgs:  ["major"],
    },
    {

        skip,
        message:   "Dry run Bump single package",
        options:   { dry: true },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "0.0.1",
                } as Partial<Manifest>,
            ),
        },
        expected: { },
        bumpArgs: ["major"],
    },
    {

        skip,
        message:   "Dry run Bump workspace",
        options:   { dry: true },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-root",
                    version: "1.0.0",
                } as Partial<Manifest>,
            ),
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as Partial<Manifest>,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:    "package-b",
                    version: "1.0.0",
                } as Partial<Manifest>,
            ),
        },
        expected: { },
        bumpArgs: ["major"],
    },
    {
        skip,
        message:   "Bump private package",
        options:   { dry: true },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    private: true,
                    name:    "package-a",
                    version: "1.0.0",
                } as Partial<Manifest>,
            ),
        },
        expected: { },
        bumpArgs: ["major"],
    },
    {
        skip,
        message:   "Bump single package",
        options:   { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as Partial<Manifest>,
            ),
        },
        expected:
        {
            "package-a":
            {
                name:    "package-a",
                version: "2.0.0",
            },
        },
        bumpArgs:  ["major"],
    },
    {

        skip,
        message:   "Bump workspaces",
        options:   { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:       "package-root",
                    version:    "1.0.0",
                    workspaces: ["packages/*"],
                } as Partial<Manifest>,
            ),
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as Partial<Manifest>,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:    "package-b",
                    version: "1.0.0",
                } as Partial<Manifest>,
            ),
        },
        expected:
        {
            "package-root":
            {
                name:       "package-root",
                version:    "2.0.0",
                workspaces: ["packages/*"],
            },
            "package-a":
            {
                name:    "package-a",
                version: "2.0.0",
            },
            "package-b":
            {
                name:    "package-b",
                version: "2.0.0",
            },
        },
        bumpArgs: ["major"],
    },
    {

        skip,
        message:   "Bump nested workspaces",
        options:   { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:       "package-root",
                    version:    "1.0.0",
                    workspaces: ["packages/*"],
                } as Partial<Manifest>,
            ),
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as Partial<Manifest>,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:    "package-b",
                    version: "1.0.0",
                } as Partial<Manifest>,
            ),
            "./packages/nested-root/package.json": JSON.stringify
            (
                {
                    name:       "nested-root",
                    version:    "1.0.0",
                    workspaces: ["packages/*"],
                } as Partial<Manifest>,
            ),
            "./packages/packages/nested-package-a/package.json": JSON.stringify
            (
                {
                    name:    "nested-package-a",
                    version: "1.0.0",
                } as Partial<Manifest>,
            ),
            "./packages/packages/nested-package-b/package.json": JSON.stringify
            (
                {
                    name:    "nested-package-b",
                    version: "1.0.0",
                } as Partial<Manifest>,
            ),
        },
        expected:
        {
            "package-root":
            {
                name:       "package-root",
                version:    "2.0.0",
                workspaces: ["packages/*"],
            },
            "package-a":
            {
                name:    "package-a",
                version: "2.0.0",
            },
            "package-b":
            {
                name:    "package-b",
                version: "2.0.0",
            },
            "nested-root":
            {
                name:       "nested-root",
                version:    "2.0.0",
                workspaces: ["packages/*"],
            },
        },
        bumpArgs: ["major"],
    },
    {
        skip,
        message:   "Bump workspace with independent version",
        options:   { independentVersion: true },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:       "package-root",
                    version:    "1.0.0",
                    workspaces: ["packages/*"],
                } as Partial<Manifest>,
            ),
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "2.0.0",
                } as Partial<Manifest>,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:    "package-b",
                    version: "3.0.0",
                } as Partial<Manifest>,
            ),
        },
        expected:
        {
            "package-root":
            {
                name:       "package-root",
                version:    "2.0.0",
                workspaces: ["packages/*"],
            },
            "package-a":
            {
                name:    "package-a",
                version: "3.0.0",
            },
            "package-b":
            {
                name:    "package-b",
                version: "4.0.0",
            },
        },
        bumpArgs: ["major"],
    },
    {
        skip,
        message: "Bump workspace without file reference update",
        options:
        {
            logLevel:           LogLevel.Trace,
            independentVersion: true,
        },
        bumpArgs:  ["minor"],
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:       "package-root",
                    version:    "1.0.0",
                    workspaces: ["packages/*"],
                } as Partial<Manifest>,
            ),
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
            "package-root":
            {
                name:       "package-root",
                version:    "1.1.0",
                workspaces: ["packages/*"],
            },
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
                    "package-a": "file:../package-a",
                },
                version: "0.2.0",
            },
            "package-c":
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
                version: "1.1.0",
            },
            "package-d":
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
                version: "1.1.0",
            },
        },
    },
    {
        skip:    false,
        message: "Bump workspace with file reference update",
        options:
        {
            logLevel:             LogLevel.Trace,
            independentVersion:   true,
            updateFileReferences: true,
        },
        bumpArgs:  ["minor"],
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:       "package-root",
                    version:    "1.0.0",
                    workspaces: ["packages/*"],
                } as Partial<Manifest>,
            ),
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
            "package-root":
            {
                name:       "package-root",
                version:    "1.1.0",
                workspaces: ["packages/*"],
            },
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
    },
    {
        skip,
        message:   "Bump prerelease with identifier",
        options:   { },
        bumpArgs:  ["prerelease", "alpha"],
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "0.0.1",
                } as Partial<Manifest>,
            ),
        },
        expected:
        {
            "package-a":
            {
                name:    "package-a",
                version: "0.0.2-alpha.0",
            },
        },
    },
    {
        skip,
        message:   "Bump with custom version",
        options:   { },
        bumpArgs:  ["custom", "1.0.0-alpha"],
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "0.0.1",
                } as Partial<Manifest>,
            ),
        },
        expected:
        {
            "package-a":
            {
                name:    "package-a",
                version: "1.0.0-alpha",
            },
        },
    },
    {
        skip,
        message:   "Bump with glob prerelease",
        options:   { },
        bumpArgs:  ["custom", "*-dev+2022.5"],
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "0.0.1",
                } as Partial<Manifest>,
            ),
        },
        expected:
        {
            "package-a":
            {
                name:    "package-a",
                version: "0.0.1-dev+2022.5",
            },
        },
    },
];

export const invalidScenarios: BumpScenario[] =
[
    {
        skip,
        message:   "Bump with multiples updates",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/package-a/package.json",
            ],
        },
        bumpArgs:  ["minor"],
        directory:
        {
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "invalid",
                    } as Partial<Manifest>,
                ),
            },
        },
        expected: { },
    },
];
