import type { PackageJson as _PackageJson } from "@npm/types";
import Status                               from "../internal/enums/status.js";
import type { Options }                     from "../internal/publisher.js";
import type VirtualDirectory                from "./types/virtual-directory.js";

type PackageJson = _PackageJson & { workspaces?: string[] };

const skip = false;

export type UnpublishScenario =
{
    skip:      boolean,
    message:   string,
    options:   Options,
    directory: VirtualDirectory,
    registry:  Record<string, Status>,
    expected:  { unpublished: string[] },
};

export const validScenarios: UnpublishScenario[] =
[
    {
        message:   "Unpublish with no packages",
        options:   { },
        registry:  { },
        directory: { },
        expected:  { unpublished: [] },
        skip,
    },
    {
        message:  "Dry run",
        options:  { dry: true },
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
                    version: "1.0.0",
                } as Partial<PackageJson>,
            ),
        },
        expected:
        {
            unpublished: [],
        },
        skip,
    },
    {
        message:  "Unpublish private package",
        options:  { },
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
        expected:  { unpublished: [] },
        skip,
    },
    {
        message:   "Unpublish package not in registry",
        options:   { },
        registry:
        {
            "package-a": Status.New,
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
        skip,
    },
    {
        message:  "Unpublish workspaces",
        options:  { },
        registry:
        {
            "package-a": Status.InRegistry,
            "package-b": Status.InRegistry,
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
        skip,
    },
    {
        message:  "Unpublish workspaces with npmrc authentication",
        options:  { },
        registry:
        {
            "package-a": Status.InRegistry,
            "package-b": Status.New,
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
        skip,
    },
];
