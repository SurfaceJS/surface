/* cSpell:ignore premajor, preminor, prepatch */

import child_process        from "child_process";
import type { ReleaseType } from "semver";

export async function execute(command: string, cwd: string): Promise<void>
{
    await new Promise<void>
    (
        (resolve, reject) =>
        {
            const childProcess = child_process.exec(command, { cwd });

            childProcess.stdout?.on("data", x => console.log(String(x).trimEnd()));
            childProcess.stderr?.on("data", x => console.log(String(x).trimEnd()));

            childProcess.on("error", x => (console.log(String(x)), reject));
            childProcess.on("exit", resolve);
        },
    );
}

export function isPrerelease(releaseType: ReleaseType | "custom"): releaseType is Exclude<ReleaseType, "major" | "minor" | "patch">
{
    return releaseType.startsWith("pre");
}

export const toBoolean = (value: string): boolean => value === "" || value == "true";

export const toEnum = (...values: (string | [string, number | string])[]): (value?: string) => string | number =>
{
    const entries = values.map(x => typeof x == "string" ? [x.toLowerCase(), x] : [x[0].toLowerCase(), x[1]]);
    const $enum   = Object.fromEntries(entries) as Record<string, string | number>;

    return (value: string = ""): string | number =>
    {
        const entry = $enum[value.toLowerCase()];

        if (entry)
        {
            return entry;
        }

        throw new Error(`'${value}' is not an valid option of '${values.join(", ")}'`);
    };
};
