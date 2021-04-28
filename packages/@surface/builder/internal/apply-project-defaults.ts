import path                          from "path";
import { DeepMergeFlags, deepMerge } from "@surface/core";
import { lookupFile }                from "@surface/io";
import { locateEslint }              from "./common.js";
import type Project                  from "./types/project";

const cwd = process.cwd();

const cache: Record<string, string | undefined> = { };

export default function applyProjectDefaults(project: Project): Project
{
    const context  = project.context ?? cwd;
    const eslintrc = cache.eslintrc ??= locateEslint(cwd) ?? undefined;

    const defaultProject: Project =
    {
        analyzer:
        {
            analyzerMode: "static",
        },
        configurations:
        {
            development:
            {
                cache:
                {
                    maxAge: 3600000,
                    name:   ".cache",
                    type:   "filesystem",
                },
                optimization:
                {
                    chunkIds:             "named",
                    concatenateModules:   false,
                    emitOnErrors:         false,
                    flagIncludedChunks:   false,
                    mangleExports:        false,
                    mergeDuplicateChunks: false,
                    minimize:             false,
                    moduleIds:            "named",
                    providedExports:      true,
                    usedExports:          false,
                },
                performance:
                {
                    hints: false,
                },
            },
            production:
            {
                cache:        false,
                optimization:
                {
                    chunkIds:             "total-size",
                    concatenateModules:   true,
                    emitOnErrors:         false,
                    flagIncludedChunks:   true,
                    mangleExports:        true,
                    mergeDuplicateChunks: true,
                    minimize:             true,
                    moduleIds:            "size",
                    providedExports:      true,
                    usedExports:          true,
                },
                performance:
                {
                    hints: "error",
                },
            },
        },
        context,
        entry:  "index.js",
        eslint:
        {
            cwd,
            enabled: !!eslintrc,
            eslintrc,
            files:   `${context}/**/*.{js,ts}`,
        },
        filename:   "[name].js",
        index:      cache.index ??= lookupFile([path.join(cwd, "index.html")]) ?? undefined,
        mode:       "development",
        output:     cache.output ??= path.join(cwd, "dist"),
        publicPath: "/",
        target:     "web",
        tsconfig:   cache.tsconfig ??= lookupFile([path.join(cwd, "tsconfig.json")]) ?? undefined,
    };

    return deepMerge([defaultProject, project], DeepMergeFlags.IgnoreUndefined);
}
