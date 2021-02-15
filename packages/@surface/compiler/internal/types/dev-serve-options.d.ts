import type Logging from "./logging";

type DevServerOptions =
{
    host?:    string,
    hot?:     boolean,
    logging?: Logging,
    port?:    number,
};

export default DevServerOptions;