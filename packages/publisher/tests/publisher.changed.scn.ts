import type { PackageJson as _PackageJson } from "@npm/types";
import type { Options }                     from "../internal/publisher.js";
import type Publisher                       from "../internal/publisher.js";
import type VirtualDirectory                from "./types/virtual-directory.js";
import type VirtualRegistry                 from "./types/virtual-registry.js";

type PackageJson = _PackageJson & { workspaces?: string[] };

const skip = false;

export type ChangedScenario =
{
    skip:      boolean,
    message:   string,
    args:      Parameters<Publisher["changed"]>,
    options:   Options,
    registry:  VirtualRegistry,
    directory: VirtualDirectory,
    expected:  string[],
};

export const validChangedScenarios: ChangedScenario[] =
[
    {

        skip,
        message:   "Changed with no packages",
        options:   { },
        args:      [],
        registry:  { },
        directory: { },
        expected:  [],
    },
    {

        skip,
        message:   "Changed with no remote version",
        options:   { },
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
        expected:  ["package-a"],
    },
    {

        skip,
        message:  "Changed with no changes",
        options:  { },
        args:     [],
        registry:
        {
            "package-a":
            {
                remote:     { latest: { } },
                hasChanges: false,
            },
        },
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
        expected: [],
    },
    {

        skip,
        message:  "Changed with changes",
        options:  { },
        args:     [],
        registry:
        {
            "package-a":
            {
                remote:     { latest: { } },
                hasChanges: true,
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
            "./packages/package-a/package.json": JSON.stringify
            (
                {
                    name:    "package-a",
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
        },
        expected: ["package-a"],
    },
];
