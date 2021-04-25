import fs                 from "fs";
import path               from "path";
import { pathToFileURL }  from "url";
import util               from "util";
import { lookupFile }     from "@surface/io";
import type webpack       from "webpack";
import { booleanPattern } from "./patterns.js";
import type Logging       from "./types/logging.js";

const readFileAsync = util.promisify(fs.readFile);

export function normalizeUrlPath(path: string): string
{
    return path ? (path.startsWith("/") ? "" : "/") + path.replace(/\/$/, "") : "";
}

export function createStats(logging: Logging = true): webpack.Configuration["stats"]
{
    if (logging && logging != "none")
    {
        return {
            assets:       logging == true,
            children:     logging == true,
            colors:       true,
            errorDetails: logging == "verbose",
            errors:       logging != "info",
            logging:      logging == true ? "info" : logging,
            modules:      logging == true || logging == "log" || logging == "verbose",
            version:      logging == true || logging == "log" || logging == "verbose",
            warnings:     logging != "info",
        };
    }

    return {
        assets:   false,
        colors:   true,
        errors:   false,
        logging:  "none",
        modules:  false,
        warnings: false,
    };
}

export async function loadModule(path: string): Promise<unknown>
{
    if (path.endsWith(".json"))
    {
        if (fs.existsSync(path))
        {
            return JSON.parse((await readFileAsync(path)).toString());
        }

        throw new Error(`Cannot find the file ${path}`);
    }

    return import(pathToFileURL(path).href);
}

export function locateEslint(cwd: string): string | null
{
    const lookups =
    [
        path.join(cwd, ".eslintrc.js"),
        path.join(cwd, ".eslintrc.json"),
        path.join(cwd, ".eslintrc.yml"),
        path.join(cwd, ".eslintrc.yaml"),
    ];

    return lookupFile(lookups);
}

export const parsePattern = (pattern: RegExp) =>
    (value: string = ""): string =>
    {
        if (pattern.test(value))
        {
            return value.toLowerCase();
        }

        throw new Error(`'${value}' dont match the pattern ${pattern}`);
    };

export const toBooleanOrParsePattern = (pattern: RegExp) =>
    (value: string = ""): string | boolean =>
    {
        if (value)
        {
            if (booleanPattern.test(value))
            {
                return value == value.toLowerCase();
            }

            return parsePattern(pattern)(value);
        }

        return true;
    };

export function toArray(value: string = ""): string[]
{
    return value.split(",");
}

export function toBoolean(value: string = ""): boolean
{
    return booleanPattern.test(value) ? value.toLowerCase() == "true" : false;
}

export function toNumberOrBooleanOrStringArray(value: string = ""): boolean | string[] | number
{
    if (!Number.isNaN(Number(value)))
    {
        return Number(value);
    }

    return toBooleanOrStringArray(value);
}

export function toBooleanOrStringArray(value: string): boolean | string[]
{
    return !value
        ? false
        : booleanPattern.test(value)
            ? value.toLowerCase() == "true"
            : value.split(",");
}

export function log(message?: unknown, ...params: unknown[]): void
{
    console.log(message, ...params);
}