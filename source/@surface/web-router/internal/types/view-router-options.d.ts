import type { Constructor } from "@surface/core";
import type Container       from "@surface/dependency-injection";
import type IMiddleware     from "../interfaces/middleware.js";

type ViewRouterOptions =
{
    middlewares?: (Constructor<IMiddleware> | IMiddleware)[],
    container?:   Container,
    baseUrl?:     string,
};

export default ViewRouterOptions;
