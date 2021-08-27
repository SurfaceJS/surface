type CliDevServerOptions =
{
    devserverCompress?:              boolean,
    // devserverContentBase?:           boolean | number | string[],
    // devserverContentBasePublicPath?: string | string[],
    devserverHost?:                  "local-ip" | "local-ipv4" | "local-ipv6" | string | undefined,
    devserverHot?:                   "only" | boolean | undefined,
    // devserverHotOnly?:               boolean,
    // devserverIndex?:                 string,
    // devserverLazy?:                  boolean,
    devserverLiveReload?:            boolean,
    devserverOpen?:                  boolean | string | string[],
    // devserverOpenPage?:              string[],
    devserverPort?:                  "auto" | number | undefined,
    // devserverPublic?:                string,
    // devserverQuiet?:                 boolean,
    // devserverUseLocalIp?:            boolean,
    // devserverWatchContentBase?:      boolean,
    // devserverWriteToDisk?:           boolean,
};

export default CliDevServerOptions;