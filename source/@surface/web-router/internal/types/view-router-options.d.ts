import type Container   from "@surface/dependency-injection.js";
import type IMiddleware from "../interfaces/middleware.js";

type ViewRouterOptions =
{
    middlewares?: IMiddleware[],
    container?:   Container,
    baseUrl?:     string,
};

export default ViewRouterOptions;
