import { parsePatternPath } from "./common";

const combine = (...args: string[]): RegExp => new RegExp(args.map(x => `(${parsePatternPath(x).source})`).join("|"));

const patterns =
{
    clean:
    {
        excludes: combine
        (
            "**/@?types/**/*.d.ts",
            "**/cli.js",
            "**/environment.d.ts",
            "**/interfaces/**/*.d.ts",
            "**/node_modules",
        ),
        includes: combine
        (
            "**/*.d.ts",
            "**/*.js(.map)?",
            "**/*.tsbuildinfo",
        ),
    },
};

export default patterns;