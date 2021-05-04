type CliDevServerOptions =
{
    devserverCompress?:              boolean,
    devserverContentBase?:           boolean | number | string[],
    devserverContentBasePublicPath?: string | string[],
    devserverHost?:                  string,
    devserverHot?:                   boolean,
    devserverHotOnly?:               boolean,
    devserverIndex?:                 string,
    devserverLazy?:                  boolean,
    devserverLiveReload?:            boolean,
    devserverOpen?:                  string | boolean,
    devserverOpenPage?:              string[],
    devserverPort?:                  number,
    devserverPublic?:                string,
    devserverQuiet?:                 boolean,
    devserverUseLocalIp?:            boolean,
    devserverWatchContentBase?:      boolean,
    devserverWriteToDisk?:           boolean,
};

export default CliDevServerOptions;