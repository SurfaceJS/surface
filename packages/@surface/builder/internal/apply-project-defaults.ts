import { DeepMergeFlags, deepMerge } from "@surface/core";
import { locateProjectPaths }        from "./common.js";
import type Project                  from "./types/project";

const cwd = process.cwd();
export default function applyProjectDefaults(project: Project): Project
{
    const projectPaths = locateProjectPaths(cwd);

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
        entry:  "index.js",
        eslint:
        {
            cwd,
            enabled: !!projectPaths.eslint?.eslintrc,
            files:   `${cwd}/**/*.{js,ts}`,
        },
        filename:   "[name].js",
        mode:       "development",
        publicPath: "/",
        target:     "web",
    };

    return deepMerge([defaultProject, projectPaths, project], DeepMergeFlags.IgnoreUndefined);
}
