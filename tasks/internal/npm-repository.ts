import RegClient, { IPackage } from "npm-registry-client";
import Version                 from "./version";

const silentLog =
{
    error:   (...args: Array<unknown>) => console.log(args.join(" ")),
    http:    () => undefined,
    info:    () => undefined,
    verbose: () => undefined,
};

export enum Status
{
    New,
    Updated,
    InRegistry
}

export default class NpmRepository
{
    private readonly client: RegClient;
    private readonly registry: string;

    public readonly addTag  = this.promisify(this.client.distTags.add);
    public readonly get     = this.promisify(this.client.get);
    public readonly publish = this.promisify(this.client.publish);

    public constructor(registry: string = "https://registry.npmjs.org", silent: boolean = true)
    {
        this.registry = registry;
        this.client   = new RegClient(silent ? { log: silentLog } : { });
    }

    // tslint:disable-next-line: no-any
    private promisify<T extends (...args: any) => any, A extends Parameters<T>>(fn: T): (uri: A[0], params: A[1]) => Promise<Parameters<A[2]>[1]>
    {
        return (uri: A[0], params: A[1]) =>
        {
            return new Promise((resolve, reject) => fn.call(this.client, `${this.registry}/${uri}`, params, (error: Error|null, data: unknown) => error ? reject(error) : resolve(data as Parameters<A[2]>[1])));
        };
    }

    public async getLatestVersion(packageName: string): Promise<string|null>
    {
        try
        {
            const data = await this.get(packageName, { });

            const versions = Object.keys(data.versions);

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