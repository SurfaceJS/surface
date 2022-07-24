import { LogLevel }          from "@surface/logger";
import type { Manifest }     from "pacote";
import Status                from "../internal/enums/status.js";
import type { Options }      from "../internal/publisher.js";
import type VirtualDirectory from "./types/virtual-directory";

const skip = false;

export type UnpublishScenario =
{
    message:   string,
    options:   Options,
    directory: VirtualDirectory,
    registry:  Record<string, Status>,
    skip:      boolean,
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
        message:   "Unpublish package not in registry",
        options:   { },
        registry:
        {
            "package-a": Status.New,
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
            },
        },
        expected:  { unpublished: [] },
        skip,
    },
    {
        message:   "Unpublish private package",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        registry:
        {
            "package-a": Status.InRegistry,
            "package-b": Status.InRegistry,
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
                        private: true,
                        name:    "package-b",
                        version: "0.0.1",
                    } as Partial<Manifest>,
                ),
            },
        },
        expected:  { unpublished: ["package-a"] },
        skip,
    },
    {
        message:   "Unpublish multiples packages",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        registry:
        {
            "package-a": Status.InRegistry,
            "package-b": Status.InRegistry,
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
                        name:    "package-b",
                        version: "0.1.0",
                    } as Partial<Manifest>,
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
        message:   "Unpublish multiples packages with dependency",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        registry:
        {
            "package-a": Status.InRegistry,
            "package-b": Status.InRegistry,
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
                            "package-a": "0.0.1",
                        },
                        version: "0.1.0",
                    } as Partial<Manifest>,
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
];
