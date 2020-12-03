// eslint-disable-next-line sort-keys
const prereleaseMap = { dev: 0, alpha: 1, beta:  2, rc: 3 };
const pattern       = /^(\d+)\.(\d+)\.(\d+)(?:-(\w+)\.(\d+))?$/;

export type PrereleaseTypes = "alpha" | "beta" | "dev" | "rc";
export type Prerelease      = { type: PrereleaseTypes, version: number };

export default class Version
{
    public major:    number;
    public minor:    number;
    public revision: number;

    public prerelease?: Prerelease;

    public constructor(major: number, minor: number, revision: number, prerelease?: Prerelease)
    {
        this.major      = major;
        this.minor      = minor;
        this.revision   = revision;
        this.prerelease = prerelease;
    }

    public static parse(version: string): Version
    {
        const match = pattern.exec(version);

        if (match)
        {
            const [, major, minor, revision, prereleaseType = null, prereleaseVersion = null] = match;

            const version = new Version(Number(major), Number(minor), Number(revision));

            if (prereleaseType && prereleaseVersion)
            {
                version.prerelease = { type: prereleaseType as PrereleaseTypes, version: Number(prereleaseVersion) };
            }

            return version;
        }

        throw new Error("Invalid semver format");
    }

    public static subtract(left: Version, right: Version): Version
    {
        if (left.prerelease && right.prerelease)
        {
            const type = prereleaseMap[left.prerelease.type] < prereleaseMap[right.prerelease.type]
                ? left.prerelease.type
                : right.prerelease.type;

            const prerelease = { type, version: left.prerelease.version - right.prerelease.version };

            return new Version(left.major - right.major, left.minor - right.minor, left.revision - right.revision, prerelease);
        }

        return new Version(left.major - right.major, left.minor - right.minor, left.revision - right.revision);
    }

    public static difference(left: Version, right: Version): { version: Version, type: "major" | "minor" | "revision" | "prerelease" | "none" }
    {
        const difference = Version.subtract(left, right);

        const type = difference.major > 0
            ? "major"
            : difference.minor > 0
                ? "minor"
                : difference.revision > 0
                    ? "revision"
                    : difference.prerelease?.version ?? 0
                        ? "prerelease"
                        : "none";

        return { type, version: difference };

    }

    public static compare(left: Version, right: Version): number
    {
        if (left.major > right.major)
        {
            return 1;
        }
        else if (left.major == right.major)
        {
            if (left.minor > right.minor)
            {
                return 1;
            }

            if (left.minor == right.minor)
            {
                if (left.revision > right.revision)
                {
                    return 1;
                }

                if (left.revision == right.revision)
                {
                    if (!left.prerelease && !!right.prerelease)
                    {
                        return 1;
                    }

                    if (!!left.prerelease && !right.prerelease)
                    {
                        return -1;
                    }

                    if (left.prerelease && right.prerelease)
                    {
                        if (prereleaseMap[left.prerelease.type] > prereleaseMap[right.prerelease.type])
                        {
                            return 1;
                        }

                        if (left.prerelease.type == right.prerelease.type)
                        {
                            if (left.prerelease.version == right.prerelease.version)
                            {
                                return 0;
                            }

                            if (left.prerelease.version > right.prerelease.version)
                            {
                                return 1;
                            }

                            return -1;
                        }

                        return -1;
                    }

                    return 0;
                }

                return -1;
            }

            return -1;
        }

        return -1;
    }

    public toString(): string
    {
        return `${this.major}.${this.minor}.${this.revision}${this.prerelease ? `-${this.prerelease.type}.${this.prerelease.version}` : ""}`;
    }
}