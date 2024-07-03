/* eslint-disable max-lines */
import type { PackageJson as _PackageJson } from "@npm/types";
import { LogLevel }                         from "@surface/logger";
import type { Callback }                    from "conventional-recommended-bump";
import type { Options }                     from "../internal/publisher.js";
import type Publisher                       from "../internal/publisher.js";
import type VirtualDirectory                from "./types/virtual-directory.js";
import type VirtualRegistry                 from "./types/virtual-registry.js";

type PackageJson = _PackageJson & { workspaces?: string[] };

const skip = false;

export type BumpScenario =
{
    args:         Parameters<Publisher["bump"]>,
    directory:    VirtualDirectory,
    expected:
    {
        bumps:      Record<string, PackageJson>,
        tags:       string[],
        changelogs: string[],
    },
    env?:         NodeJS.ProcessEnv,
    message:      string,
    options:      Options,
    recommended?: Record<string, Callback.Recommendation.ReleaseType | undefined>,
    registry:     VirtualRegistry,
    skip:         boolean,
};

export const validBumpScenarios: BumpScenario[] =
[
    {

        skip,
        message:   "Bump with no updates",
        options:   { },
        registry:  { },
        directory: { },
        expected:  { bumps: { }, changelogs: [], tags: [] },
        args:      ["major"],
    },
    {

        skip,
        message:   "[DRY] Bump single package",
        options:   { dry: true },
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "0.0.1",
                } as PackageJson,
            ),
        },
        expected: { bumps: { }, changelogs: [], tags: [] },
        args:     ["major"],
    },
    {

        skip,
        message:   "[DRY] Bump workspace",
        options:   { dry: true },
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-root",
                    version: "1.0.0",
                } as PackageJson,
            ),
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as PackageJson,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:    "package-b",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected: { bumps: { }, changelogs: [], tags: [] },
        args:     ["major"],
    },
    {

        skip,
        message:   "[DRY] Bump and commit",
        options:   { dry: true },
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "0.0.1",
                } as PackageJson,
            ),
        },
        expected: { bumps: { }, changelogs: [], tags: [] },
        args:     ["major", undefined, undefined, { commit: true }],
    },
    {

        skip,
        message:   "[DRY] Bump, commit and push to remote",
        options:   { dry: true },
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "0.0.1",
                } as PackageJson,
            ),
        },
        expected: { bumps: { }, changelogs: [], tags: [] },
        args:     ["major", undefined, undefined, { commit: true, pushToRemote: true }],
    },
    {

        skip,
        message:   "[DRY] Generate changelog",
        options:   { dry: true },
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "0.0.1",
                } as PackageJson,
            ),
        },
        expected: { bumps: { }, changelogs: [], tags: [] },
        args:     ["major", undefined, undefined, { changelog: true }],
    },
    {

        skip,
        message:   "[DRY] Create Release",
        options:   { dry: true },
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "0.0.1",
                } as PackageJson,
            ),
        },
        expected: { bumps: { }, changelogs: [], tags: [] },
        args:     ["major", undefined, undefined, { createRelease: "gitlab" }],
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
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
                "package-a":
                {
                    name:    "package-a",
                    version: "2.0.0",
                },
            },
            changelogs: [],
            tags:       [],
        },
        args:  ["major"],
    },
    {
        skip,
        message:   "Bump single package and commit",
        options:   { },
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
                "package-a":
                {
                    name:    "package-a",
                    version: "2.0.0",
                },
            },
            changelogs: [],
            tags:       ["v2.0.0"],
        },
        args:  ["major", undefined, undefined, { commit: true }],
    },
    {
        skip,
        message:   "Try bump single private package",
        options:   { },
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    private: true,
                    name:    "package-a",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:      {},
            changelogs: [],
            tags:       [],
        },
        args:  ["major"],
    },
    {
        skip,
        message:   "Try bump single private package and commit",
        options:   { },
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    private: true,
                    name:    "package-a",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:      {},
            changelogs: [],
            tags:       [],
        },
        args:  ["major", undefined, undefined, { commit: true }],
    },
    {
        skip,
        message:   "Bump single private package",
        options:   { },
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    private: true,
                    name:    "package-a",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
                "package-a":
                {
                    private: true,
                    name:    "package-a",
                    version: "2.0.0",
                },
            },
            changelogs: [],
            tags:       [],
        },
        args:  ["major", undefined, undefined, { includePrivate: true }],
    },
    {
        skip,
        message:   "Bump single private package and commit",
        options:   { },
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    private: true,
                    name:    "package-a",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
                "package-a":
                {
                    private: true,
                    name:    "package-a",
                    version: "2.0.0",
                },
            },
            changelogs: [],
            tags:       ["v2.0.0"],
        },
        args:  ["major", undefined, undefined, { commit: true, includePrivate: true }],
    },
    {
        skip,
        message:     "Bump single package with recommended",
        options:     { },
        registry:    { },
        recommended: { "package-a": "patch" },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
                "package-a":
                {
                    name:    "package-a",
                    version: "1.0.1",
                },
            },
            changelogs: [],
            tags:       [],
        },
        args:        ["recommended"],
    },
    {
        skip,
        message:     "Bump single package with recommended without changes",
        options:     { },
        registry:    { },
        recommended: { "package-a": undefined },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
                "package-a":
                {
                    name:    "package-a",
                    version: "1.0.0",
                },
            },
            changelogs: [],
            tags:       [],
        },
        args:        ["recommended"],
    },
    {
        skip,
        message:   "Bump multiples packages",
        options:   { packages: ["packages/*"] },
        registry:  { },
        directory:
        {
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as PackageJson,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:    "package-b",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
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
            changelogs: [],
            tags:       [],
        },
        args: ["major", undefined, undefined, { independent: true }],
    },
    {
        skip,
        message:   "Bump multiples packages and commit",
        options:   { packages: ["packages/*"] },
        registry:  { },
        directory:
        {
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as PackageJson,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:    "package-b",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
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
            changelogs: [],
            tags:       ["package-a@2.0.0", "package-b@2.0.0"],
        },
        args: ["major", undefined, undefined, { commit: true, independent: true }],
    },
    {
        skip,
        message:   "Try bump workspaces root",
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
                } as PackageJson,
            ),
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as PackageJson,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:    "package-b",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
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
            changelogs: [],
            tags:       [],
        },
        args: ["major", undefined, undefined, { independent: true }],
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
                } as PackageJson,
            ),
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as PackageJson,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:    "package-b",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
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
            changelogs: [],
            tags:       [],
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
                } as PackageJson,
            ),
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as PackageJson,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:    "package-b",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
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
            changelogs: [],
            tags:       [],
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
                } as PackageJson,
            ),
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as PackageJson,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:    "package-b",
                    version: "1.0.0",
                } as PackageJson,
            ),
            "./packages/nested-root/package.json": JSON.stringify
            (
                {
                    name:       "nested-root",
                    version:    "1.0.0",
                    workspaces: ["packages/*"],
                } as PackageJson,
            ),
            "./packages/packages/nested-package-a/package.json": JSON.stringify
            (
                {
                    name:    "nested-package-a",
                    version: "1.0.0",
                } as PackageJson,
            ),
            "./packages/packages/nested-package-b/package.json": JSON.stringify
            (
                {
                    name:    "nested-package-b",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
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
            changelogs: [],
            tags:       [],
        },
        args: ["major"],
    },
    {
        skip,
        message:   "Bump workspace with independent version",
        options:   { },
        args:      ["major", undefined, undefined, { independent: true }],
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:       "package-root",
                    version:    "1.0.0",
                    workspaces: ["packages/*"],
                } as PackageJson,
            ),
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "2.0.0",
                } as PackageJson,
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
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
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
            changelogs: [],
            tags:       [],
        },
    },
    {
        skip,
        message:   "Bump workspace with independent version and dependencies synchronization",
        options:   { },
        args:      ["major", undefined, undefined, { independent: true, synchronize: true }],
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:       "package-root",
                    version:    "1.0.0",
                    workspaces: ["packages/*"],
                } as PackageJson,
            ),
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "2.0.0",
                } as PackageJson,
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
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
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
            changelogs: [],
            tags:       [],
        },
    },
    {
        skip,
        message: "Bump workspace without file reference update",
        options:
        {
            logLevel: LogLevel.Trace,
        },
        args:      ["minor", undefined, undefined, { independent: true }],
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:       "package-root",
                    version:    "1.0.0",
                    workspaces: ["packages/*"],
                } as PackageJson,
            ),
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as PackageJson,
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
                    } as PackageJson,
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
                    } as PackageJson,
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
                    } as PackageJson,
                ),
            },
        },
        expected:
        {
            bumps:
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
            changelogs: [],
            tags:       [],
        },
    },
    {
        skip,
        message: "Bump workspace with file reference update",
        options:
        {
            logLevel: LogLevel.Trace,
        },
        args:      ["minor", undefined, undefined, { independent: true, updateFileReferences: true }],
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:       "package-root",
                    version:    "1.0.0",
                    workspaces: ["packages/*"],
                } as PackageJson,
            ),
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as PackageJson,
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
                    } as PackageJson,
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
                    } as PackageJson,
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
                    } as PackageJson,
                ),
            },
        },
        expected:
        {
            bumps:
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
            changelogs: [],
            tags:       [],
        },
    },
    {
        skip,
        message: "Bump workspace with outside file reference",
        options:
        {
            logLevel: LogLevel.Trace,
        },
        args:      ["minor", undefined, undefined, { independent: true, updateFileReferences: true }],
        registry:  { },
        directory:
        {
            "./core/package.json": JSON.stringify
            (
                {
                    name:    "core",
                    version: "0.1.0",
                } as PackageJson,
            ),
            "./package.json": JSON.stringify
            (
                {
                    name:       "package-root",
                    version:    "1.0.0",
                    workspaces: ["packages/*"],
                } as PackageJson,
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
                    } as PackageJson,
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
                    } as PackageJson,
                ),
            },
        },
        expected:
        {
            bumps:
            {
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
            changelogs: [],
            tags:       [],
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
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
                "package-a":
                {
                    name:    "package-a",
                    version: "0.0.2-alpha.0",
                },
            },
            changelogs: [],
            tags:       [],
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
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
                "package-a":
                {
                    name:    "package-a",
                    version: "1.0.0-alpha",
                },
            },
            changelogs: [],
            tags:       [],
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
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
                "package-a":
                {
                    name:    "package-a",
                    version: "0.0.1-dev+2022.5",
                },
            },
            changelogs: [],
            tags:       [],
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
                } as PackageJson,
            ),
        },
        expected: { bumps: { }, changelogs: [], tags: [] },
    },
    {
        skip,
        message:   "Package with no changes and version different from remote",
        options:   { },
        args:      ["major", undefined, undefined, { independent: true, synchronize: true, updateFileReferences: true }],
        registry:
        {
            "package-a":
            {
                remote:
                {
                    latest:
                    {
                        version: "1.0.0",
                    },
                },
            },
            "package-b":
            {
                hasChanges: true,
            },
            "package-c":
            {
                remote:
                {
                    latest:
                    {
                        version: "1.0.0",
                    },
                },
                hasChanges: false,
            },
        },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:       "package-root",
                    workspaces: ["packages/*"],
                    version:    "1.0.0",
                } as PackageJson,
            ),
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.1",
                } as PackageJson,
            ),
            "./packages/package-b/package.json": JSON.stringify
            (
                {
                    name:         "package-b",
                    dependencies:
                    {
                        "package-a": "file:../package-a",
                    },
                    version: "1.0.0",
                } as PackageJson,
            ),
            "./packages/package-c/package.json": JSON.stringify
            (
                {
                    name:    "package-c",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
                "package-b":
                {
                    name:         "package-b",
                    dependencies:
                    {
                        "package-a": "~1.0.0",
                    },
                    version: "2.0.0",
                },
            },
            changelogs: [],
            tags:       [],
        },
    },
    {

        skip,
        message:   "Generate changelog",
        options:   { },
        registry:  { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "0.0.1",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
                "package-a":
                {
                    name:    "package-a",
                    version: "1.0.0",
                },
            },
            changelogs: ["."],
            tags:       [],
        },
        args:     ["major", undefined, undefined, { changelog: true }],
    },
    {

        skip,
        message:   "Create Github Release",
        options:   { },
        registry:  { },
        env:       { GITHUB_API: "api", GITHUB_TOKEN: "token" },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "0.0.1",
                } as PackageJson,
            ),
        },
        expected:
        {
            bumps:
            {
                "package-a":
                {
                    name:    "package-a",
                    version: "1.0.0",
                },
            },
            changelogs: [],
            tags:       ["v1.0.0"],
        },
        args:     ["major", undefined, undefined, { createRelease: "github" }],
    },
    {

        skip,
        message:   "Create Gitlab Release",
        options:   { packages: ["packages/*"] },
        registry:  { },
        env:       { GITLAB_API: "api", GITLAB_TOKEN: "token" },
        directory:
        {
            "./packages":
            {
                "./package-a/package.json": JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as PackageJson,
                ),
                "./package-b/package.json": JSON.stringify
                (
                    {
                        name:    "package-b",
                        version: "0.0.1",
                    } as PackageJson,
                ),
            },
        },
        expected:
        {
            bumps:
            {
                "package-a":
                {
                    name:    "package-a",
                    version: "1.0.0",
                },
                "package-b":
                {
                    name:    "package-b",
                    version: "1.0.0",
                },
            },
            changelogs: [],
            tags:       ["package-a@1.0.0", "package-b@1.0.0"],
        },
        args:     ["major", undefined, undefined, { createRelease: "gitlab", independent: true }],
    },
];

export const invalidBumpScenarios: BumpScenario[] =
[
    {
        skip,
        message:   "Bump with invalid version",
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
                    } as PackageJson,
                ),
            },
        },
        expected: { bumps: { }, changelogs: [], tags: [] },
    },
    {

        skip,
        message:   "Create Github Release with no token",
        options:   { },
        registry:  { },
        env:       { },
        directory:
        {
            "./package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "0.0.1",
                } as PackageJson,
            ),
        },
        expected: { bumps: { }, changelogs: [], tags: ["package-a@0.0.1"] },
        args:     ["major", undefined, undefined, { createRelease: "github" }],
    },
];
