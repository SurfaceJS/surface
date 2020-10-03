import Container   from "@surface/dependency-injection";
import IMiddleware from "../interfaces/middleware";

type ViewRouterOptions =
{
    middlewares?: IMiddleware[],
    container?:   Container,
    baseUrl?:     string,
};

export default ViewRouterOptions;
