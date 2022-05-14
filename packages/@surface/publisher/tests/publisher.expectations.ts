import path                              from "path";
import type { Manifest, ManifestResult } from "pacote";
import type { ReleaseType }              from "semver";
import type { Options }                  from "../internal/publisher.js";

const CWD = process.cwd();

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
    bumpType:  ReleaseType,
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
        bumpType:  "major",
        skip,
    },
    {
        message:   "Bump with multiples updates",
        options:
        {
            packages:
            [
                path.join(CWD, "package-a"),
                path.join(CWD, "package-b"),
                path.join(CWD, "package-c"),
                path.join(CWD, "package-d"),
            ],
        },
        bumpType:  "minor",
        registry:
        {
            "package-a@latest": { version: "0.0.1" } as ManifestResult,
            "package-b@latest": { version: "0.0.1" } as ManifestResult,
            "package-c@latest": { version: "0.0.1" } as ManifestResult,
            "package-d@latest": { version: "0.0.1" } as ManifestResult,
        },
        directory:
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
        expected:
        {
            "package-a":
            {
                name:    "package-a",
                version: "0.0.1",
            },
            "package-b":
            {
                name:         "package-b",
                dependencies:
                {
                    "package-a": "~0.0.1",
                },
                version: "0.2.0",
            },
            "package-c":
            {
                name:         "package-c",
                dependencies:
                {
                    "package-a": "~0.0.1",
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
                    "package-a": "~0.0.1",
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
];

export const invalidScenarios: Scenario[] =
[];