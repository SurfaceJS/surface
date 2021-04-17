import type Logging from "./logging";

type CliDevServerOptions =
{
    compress?:              boolean,
    contentBase?:           boolean | number | string[],
    contentBasePublicPath?: string | string[],
    host?:                  string,
    hot?:                   boolean,
    hotOnly?:               boolean,
    index?:                 string,
    lazy?:                  boolean,
    liveReload?:            boolean,
    logging?:               Logging,
    open?:                  string | boolean,
    openPage?:              string[],
    port?:                  number,
    public?:                string,
    quiet?:                 boolean,
    useLocalIp?:            boolean,
    watchContentBase?:      boolean,
    writeToDisk?:           boolean,
};

export default CliDevServerOptions;