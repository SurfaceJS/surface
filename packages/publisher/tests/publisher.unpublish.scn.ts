import type { PackageJson as _PackageJson } from "@npm/types";
import type { Options }                     from "../internal/publisher.js";
import type VirtualDirectory                from "./types/virtual-directory.js";
import type VirtualRegistry                 from "./types/virtual-registry.js";

type PackageJson = _PackageJson & { workspaces?: string[] };

const skip = false;

export type UnpublishScenario =
{
    skip:      boolean,
    message:   string,
    options:   Options,
    directory: VirtualDirectory,
    registry:  VirtualRegistry,
    expected:  { unpublished: string[] },
};

export const validUnpublishScenarios: UnpublishScenario[] =
[
    {
        skip,
        message:   "Unpublish with no packages",
        options:   { },
        registry:  { },
        directory: { },
        expected:  { unpublished: [] },
    },
    {
        skip,
        message:  "Dry run",
        options:  { dry: true },
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
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
        },
        expected:
        {
            unpublished: [],
        },
    },
    {
        skip,
        message:  "Unpublish private package",
        options:  { },
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
        expected:  { unpublished: [] },
    },
    {
        skip,
        message:  "Unpublish package not in registry",
        options:  { },
        registry:
        {
            "package-a": { isPublished: false, hasChanges: true },
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
        expected:  { unpublished: [] },
    },
    {
        skip,
        message:  "Unpublish workspaces",
        options:  { },
        registry:
        {
            "package-a": { isPublished: true, hasChanges: true },
            "package-b": { isPublished: true, hasChanges: true },
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
            unpublished:
            [
                "package-a",
                "package-b",
            ],
        },
    },
    {
        skip,
        message:  "Unpublish workspaces with npmrc authentication",
        options:  { },
        registry:
        {
            "package-a": { isPublished: true,  hasChanges: true },
            "package-b": { isPublished: false, hasChanges: true },
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
            "./.npmrc":   "registry=https://test.com\n_authToken=123",
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
            unpublished:
            [
                "package-a",
            ],
        },
    },
];
