/* eslint-disable max-lines */
import type { PackageJson as _PackageJson } from "@npm/types";
import { LogLevel }                         from "@surface/logger";
import type { Options }                     from "../internal/publisher.js";
import type Publisher                       from "../internal/publisher.js";
import type VirtualDirectory                from "./types/virtual-directory.js";
import type VirtualRegistry                 from "./types/virtual-registry.js";

type PackageJson = _PackageJson & { workspaces?: string[] };

const skip = false;

export type BumpScenario =
{
    skip:      boolean,
    message:   string,
    args:      Parameters<Publisher["bump"]>,
    options:   Options,
    registry:  VirtualRegistry,
    directory: VirtualDirectory,
    expected:  Record<string, Partial<PackageJson>>,
};

export const validBumpScenarios: BumpScenario[] =
[
    {

        skip,
        message:   "Bump with no updates",
        options:   { },
        registry:  { },
        directory: { },
        expected:  { },
        args:      ["major"],
    },
    {

        skip,
        message:   "Dry run Bump single package",
        options:   { dry: true },
        registry:  { },
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
        expected: { },
        args:     ["major"],
    },
    {

        skip,
        message:   "Dry run Bump workspace",
        options:   { dry: true },
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-root",
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:    "package-b",
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
        },
        expected: { },
        args:     ["major"],
    },
    {
        skip,
        message:   "Bump private package",
        options:   { dry: true },
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    private: true,
                    name:    "package-a",
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
        },
        expected: { },
        args:     ["major"],
    },
    {
        skip,
        message:   "Bump single package",
        options:   { },
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
            "package-a":
            {
                name:    "package-a",
                version: "2.0.0",
            },
        },
        args:  ["major"],
    },
    {

        skip,
        message:   "Bump workspaces",
        options:   { },
        registry:  { },
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
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:    "package-b",
                    version: "1.0.0",
                } as Partial<PackageJson>,
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
        args: ["major"],
    },
    {

        skip,
        message:   "Bump workspaces with synchronization",
        options:   {  },
        registry:  { },
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
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:    "package-b",
                    version: "1.0.0",
                } as Partial<PackageJson>,
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
        args: ["major"],
    },
    {

        skip,
        message:   "Bump nested workspaces",
        options:   { },
        registry:  { },
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
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:    "package-b",
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
            "./packages/nested-root/package.json": JSON.stringify
            (
                {
                    name:       "nested-root",
                    version:    "1.0.0",
                    workspaces: ["packages/*"],
                } as Partial<PackageJson>,
            ),
            "./packages/packages/nested-package-a/package.json": JSON.stringify
            (
                {
                    name:    "nested-package-a",
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
            "./packages/packages/nested-package-b/package.json": JSON.stringify
            (
                {
                    name:    "nested-package-b",
                    version: "1.0.0",
                } as Partial<PackageJson>,
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
        args: ["major"],
    },
    {
        skip,
        message:   "Bump workspace with independent version",
        options:   { },
        args:      ["major", undefined, { independent: true }],
        registry:  { },
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
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "2.0.0",
                } as Partial<PackageJson>,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:         "package-b",
                    version:      "3.0.0",
                    dependencies:
                    {
                        "package-a": "1.0.0",
                    },
                } as Partial<PackageJson>,
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
                name:         "package-b",
                version:      "4.0.0",
                dependencies:
                {
                    "package-a": "1.0.0",
                },
            },
        },
    },
    {
        skip,
        message:   "Bump workspace with independent version and dependencies synchronization",
        options:   { },
        args:      ["major", undefined, { independent: true, synchronize: true }],
        registry:  { },
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
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "2.0.0",
                } as Partial<PackageJson>,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:         "package-b",
                    version:      "3.0.0",
                    dependencies:
                    {
                        "package-a": "1.0.0",
                    },
                } as Partial<PackageJson>,
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
                name:         "package-b",
                version:      "4.0.0",
                dependencies:
                {
                    "package-a": "~3.0.0",
                },
            },
        },
    },
    {
        skip,
        message: "Bump workspace without file reference update",
        options:
        {
            logLevel: LogLevel.Trace,
        },
        args:      ["minor", undefined, { independent: true }],
        registry:  { },
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
                        name:         "package-b",
                        dependencies:
                        {
                            "package-a": "file:../package-a",
                        },
                        version: "0.1.0",
                    } as Partial<PackageJson>,
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
                    } as Partial<PackageJson>,
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
                    } as Partial<PackageJson>,
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
        skip,
        message: "Bump workspace with file reference update",
        options:
        {
            logLevel: LogLevel.Trace,
        },
        args:      ["minor", undefined, { independent: true, updateFileReferences: true }],
        registry:  { },
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
                        name:         "package-b",
                        dependencies:
                        {
                            "package-a": "file:../package-a",
                        },
                        version: "0.1.0",
                    } as Partial<PackageJson>,
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
                    } as Partial<PackageJson>,
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
                    } as Partial<PackageJson>,
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
        message: "Bump workspace with outside file reference",
        options:
        {
            logLevel: LogLevel.Trace,
        },
        args:      ["minor", undefined, { independent: true, updateFileReferences: true }],
        registry:  { },
        directory:
        {
            "./core/package.json": JSON.stringify
            (
                {
                    name:    "core",
                    version: "0.1.0",
                } as Partial<PackageJson>,
            ),
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
                        name:         "package-a",
                        dependencies:
                        {
                            "core": "file:../../core",
                        },
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
            "package-root":
            {
                name:       "package-root",
                version:    "1.1.0",
                workspaces: ["packages/*"],
            },
            "package-a":
            {
                name:         "package-a",
                dependencies:
                {
                    "core": "~0.1.0",
                },
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
        },
    },
    {
        skip,
        message:   "Bump prerelease with identifier",
        options:   { },
        args:      ["prerelease", "alpha"],
        registry:  { },
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
        args:      ["1.0.0-alpha"],
        registry:  { },
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
        args:      ["*-dev+2022.5"],
        registry:  { },
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
        expected:
        {
            "package-a":
            {
                name:    "package-a",
                version: "0.0.1-dev+2022.5",
            },
        },
    },
    {
        skip,
        message:   "Package with no changes",
        options:   { packages: ["package-a"] },
        args:      ["*-dev+2022.9"],
        registry:
        {
            "package-a":
            {
                remote:
                {
                    latest:
                    {
                        version: "0.0.1",
                    },
                },
            },
        },
        directory:
        {
            "./package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "0.0.1",
                } as Partial<PackageJson>,
            ),
        },
        expected:
        { },
    },
    {
        skip,
        message:   "Package with no changes and version different from remote",
        options:   { },
        args:      ["*-dev+2022.9", undefined, { synchronize: true, updateFileReferences: true }],
        registry:
        {
            "package-a":
            {
                remote:
                {
                    latest:
                    {
                        version: "0.0.1-dev+2022.1",
                    },
                },
            },
            "package-b":
            {
                hasChanges: true,
            },
        },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:       "package-root",
                    workspaces: ["packages/*"],
                    version:    "0.0.1",
                } as Partial<PackageJson>,
            ),
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "0.0.1",
                } as Partial<PackageJson>,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:         "package-b",
                    dependencies:
                    {
                        "package-a": "file:../package-a",
                    },
                    version: "0.0.1",
                } as Partial<PackageJson>,
            ),
        },
        expected:
        {
            "package-root":
            {
                name:       "package-root",
                version:    "0.0.1-dev+2022.9",
                workspaces:
                [
                    "packages/*",
                ],
            },
            "package-b":
            {
                name:         "package-b",
                dependencies:
                {
                    "package-a": "~0.0.1-dev+2022.1",
                },
                version: "0.0.1-dev+2022.9",
            },
        },
    },
];

export const invalidBumpScenarios: BumpScenario[] =
[
    {
        skip,
        message:   "[bump]: Bump with invalid version",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/package-a/package.json",
            ],
        },
        args:      ["minor"],
        registry:  { },
        directory:
        {
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "invalid",
                    } as Partial<PackageJson>,
                ),
            },
        },
        expected: { },
    },
];
