type CliDevServerOptions =
{
    devserverCompress?:   boolean,
    devserverHost?:       "local-ip" | "local-ipv4" | "local-ipv6" | string | undefined,
    devserverHot?:        "only" | boolean | undefined,
    devserverLiveReload?: boolean,
    devserverOpen?:       boolean | string | string[],
    devserverPort?:       "auto" | number | undefined,
};

export default CliDevServerOptions;