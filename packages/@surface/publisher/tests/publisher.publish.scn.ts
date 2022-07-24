import { LogLevel }          from "@surface/logger";
import type { Manifest }     from "pacote";
import Status           from "../internal/enums/status.js";
import type { Options }      from "../internal/publisher.js";
import type VirtualDirectory from "./types/virtual-directory";

const skip = false;

export type PublishScenario =
{
    message:   string,
    options:   Options,
    directory: VirtualDirectory,
    registry:  Record<string, Status>,
    skip:      boolean,
    expected:  { published: string[] },
};

export const validScenarios: PublishScenario[] =
[
    {
        message:   "Publish with no packages",
        options:   { },
        registry:  { },
        directory: { },
        expected:  { published: [] },
        skip,
    },
    {
        message:   "Publish package already in registry",
        options:   { },
        registry:
        {
            "package-a": Status.InRegistry,
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
        expected:  { published: [] },
        skip,
    },
    {
        message:   "Publish multiples packages",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
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
                        name:    "package-b",
                        version: "0.1.0",
                    } as Partial<Manifest>,
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
        skip,
    },
    {
        message:   "Publish multiples packages with dependency",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
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
                            "package-a": "0.0.1",
                        },
                        version: "0.1.0",
                    } as Partial<Manifest>,
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
        skip,
    },
];
