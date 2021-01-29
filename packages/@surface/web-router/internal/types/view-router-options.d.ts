import type { Constructor } from "@surface/core";
import type Container       from "@surface/dependency-injection";
import type IRouterMiddleware     from "../interfaces/router-middleware.js";

type ViewRouterOptions =
{
    middlewares?: (Constructor<IRouterMiddleware> | IRouterMiddleware)[],
    container?:   Container,
    baseUrl?:     string,
};

export default ViewRouterOptions;
