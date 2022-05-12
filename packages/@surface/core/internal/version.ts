import { compare } from "@surface/core/internal/common/generic.js";

// eslint-disable-next-line sort-keys
const pattern = /^v?(\d+)\.(\d+)(?:\.(\d+))?(?:-([a-zA-Z-0-9]+)(?:\+([a-zA-Z-0-9]+))?)?$/;

function prefix(value: string | undefined, prefix: string): string
{
    if (value)
    {
        return prefix + value;
    }

    return "";
}

export default class Version
{
    public constructor(public major: number, public minor: number, public patch: number, public prerelease?: string, public build?: string)
    { }

    public static parse(version: string): Version
    {
        const match = pattern.exec(version);

        if (match)
        {
            const [, major, minor, revision, prerelease, build] = match;

            return new Version(Number(major), Number(minor), Number(revision ?? ""), prerelease, build);
        }

        throw new Error("Invalid semver format");
    }

    public static compare(left: Version, right: Version): number
    {
        let difference = compare(left.major, right.major);

        if (difference == 0)
        {
            difference = compare(left.minor, right.minor);

            if (difference == 0)
            {
                difference = compare(left.patch, right.patch);

                if (difference == 0)
                {
                    if (!left.prerelease && right.prerelease)
                    {
                        difference = 1;
                    }
                    else if (left.prerelease && !right.prerelease)
                    {
                        difference = -1;
                    }
                }
            }
        }

        return difference;
    }

    public toString(): string
    {
        return `${this.major}.${this.minor}.${this.patch}${prefix(this.prerelease, "-")}${prefix(this.build, "+")}`;
    }
}