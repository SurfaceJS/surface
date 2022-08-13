import os                    from "os";
import { join }              from "path";
import { LogLevel }          from "@surface/logger";
import type { Manifest }     from "pacote";
import Status                from "../internal/enums/status.js";
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
        options:
        {
            registry: "https://test.com",
            packages: ["packages/*"],
        },
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
        message:   "Publish private package",
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
            "package-a": Status.New,
            "package-b": Status.New,
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
        expected:  { published: ["package-a"] },
        skip,
    },
    {
        message:   "Run multiple dry publications",
        options:
        {
            dry:      true,
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
            published: [],
        },
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
        registry:  { "package-b": Status.InRegistry },
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
            ],
        },
        skip,
    },
    {
        message:   "Publish multiples packages with npmrc authentication",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
        },
        registry:  { "package-b": Status.InRegistry },
        directory:
        {
            "./packages":
            {
                [join(os.homedir(), ".npmrc")]: "@lib:registry=https://test.com\n//test.com:_authToken=123",
                "./package-a/package.json":     JSON.stringify
                (
                    {
                        name:    "package-a",
                        version: "0.0.1",
                    } as Partial<Manifest>,
                ),
                "./package-a/.npmrc":       "registry=https://test.com\n_authToken=123",
                "./package-b/package.json": JSON.stringify
                (
                    {
                        name:    "@lib/package-b",
                        version: "0.1.0",
                    } as Partial<Manifest>,
                ),
                "./package-b/.npmrc":       "@lib:registry=https://test.com\n//test.com:_authToken=123",
                "./package-c/package.json": JSON.stringify
                (
                    {
                        name:    "package-c",
                        version: "0.1.0",
                    } as Partial<Manifest>,
                ),
                "./package-d/package.json": JSON.stringify
                (
                    {
                        name:    "@lib/package-d",
                        version: "0.1.0",
                    } as Partial<Manifest>,
                ),
                "./package-e/package.json": JSON.stringify
                (
                    {
                        name:    "@other-lib/package-e",
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
                "@lib/package-b",
                "package-c",
                "@lib/package-d",
                "@other-lib/package-e",
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
    {
        message:   "Publish canary",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
            ],
            canary: true,
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
