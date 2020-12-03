export default class Configuration
{
    private readonly _serverRoot: string;
    public get serverRoot(): string
    {
        return this._serverRoot;
    }

    private readonly _port: number;
    public get port(): number
    {
        return this._port;
    }

    private readonly _wwwroot: string;
    public get wwwroot(): string
    {
        return this._wwwroot;
    }

    public constructor(serverRoot: string, config: Partial<Configuration>)
    {
        this._serverRoot = serverRoot;
        this._port       = config.port    ?? 0;
        this._wwwroot    = config.wwwroot ?? "wwwroot";
    }
}