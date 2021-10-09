import type { IDisTags, IPackage } from "npm-registry-client";
import RegClient                   from "npm-registry-client";
import Status                      from "./enums/status.js";
import Version                     from "./version.js";

const silentLog =
{
    error:   (...args: unknown[]) => console.log(args.join(" ")),
    http:    () => undefined,
    info:    () => undefined,
    verbose: () => undefined,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Promisify<T extends (...args: any) => any> =
    (uri: Parameters<T>[0], params: Parameters<T>[1]) => Promise<Parameters<Parameters<T>[2]>[1]>;

export default class NpmRepository
{

    /** @deprecated Should be replaced by npm module. */
    private readonly client: RegClient;
    private readonly registry: string;

    public readonly addTag:  Promisify<IDisTags["add"]>;
    public readonly get:     Promisify<RegClient["get"]>;
    public readonly publish: Promisify<RegClient["publish"]>;

    public constructor(registry = "https://registry.npmjs.org", silent = true)
    {
        this.registry = registry;
        this.client   = silent
            ? new RegClient({ log: silentLog })
            : new RegClient();

        this.addTag  = this.promisify(this.client.distTags.add);
        this.get     = this.promisify(this.client.get);
        this.publish = this.promisify(this.client.publish);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private promisify<T extends (...args: any) => any, A extends Parameters<T>>(fn: T): (uri: A[0], params: A[1]) => Promise<Parameters<A[2]>[1]>
    {
        return async (uri: A[0], params: A[1]) =>
            // eslint-disable-next-line max-len
            new Promise((resolve, reject) => fn.call(this.client, `${this.registry}/${uri}`, params, (error: Error | null, data: unknown) => error ? reject(error) : resolve(data as Parameters<A[2]>[1])));
    }

    public async getLatestVersion(packageName: string): Promise<string | null>
    {
        try
        {
            const data = await this.get(packageName, { });

            const versions = Object.entries(data.versions)
                .filter(x => !x[1]!.deprecated)
                .map(x => x[0])
                .sort((left, right) => Version.compare(Version.parse(left), Version.parse(right)));

            return versions[versions.length - 1];
        }
        catch (error)
        {
            if ((error as { code: string }).code == "E404")
            {
                return null;
            }

            throw error;
        }
    }

    public async getStatus($package: IPackage): Promise<Status>
    {
        const latest = await this.getLatestVersion($package.name);

        if (latest)
        {
            if (Version.compare(Version.parse($package.version), Version.parse(latest)) == 1)
            {
                return Status.Updated;
            }

            return Status.InRegistry;
        }

        return Status.New;
    }
}