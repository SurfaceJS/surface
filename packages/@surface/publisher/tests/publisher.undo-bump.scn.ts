import type { ParameterOverloads } from "@surface/core";
import { LogLevel }                from "@surface/logger";
import type { Manifest }           from "pacote";
import type { Options }            from "../internal/publisher.js";
import type Publisher              from "../internal/publisher.js";
import type VirtualDirectory       from "./types/virtual-directory";

const skip = false;

export type UndoBumpScenario =
{
    message:   string,
    options:   Options,
    directory: VirtualDirectory,
    expected:  { bumped: Record<string, Partial<Manifest>>, undo: Record<string, Partial<Manifest>> },
    bumpArgs:  ParameterOverloads<Publisher["bump"]>,
    skip:      boolean,
};

export const validScenarios: UndoBumpScenario[] =
[
    {
        message:   "Undo Bump with multiples updates",
        options:
        {
            logLevel: LogLevel.Trace,
            packages:
            [
                "packages/*",
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
            },
        },
        expected:
        {
            bumped:
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
            },
            undo:
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
                        "package-a": "file:../package-a",
                    },
                    version: "0.1.0",
                },
            },
        },
        skip,
    },
];
