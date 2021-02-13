import type { Constructor } from "@surface/core";
import type Container       from "@surface/dependency-injection";
import type IRouterInterceptor     from "../interfaces/router-interceptor.js";

type ViewRouterOptions =
{
    interceptors?: (Constructor<IRouterInterceptor> | IRouterInterceptor)[],
    container?:    Container,
    baseUrl?:      string,
};

export default ViewRouterOptions;
