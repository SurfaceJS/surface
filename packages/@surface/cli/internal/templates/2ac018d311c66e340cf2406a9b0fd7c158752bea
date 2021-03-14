import { inject }                                from "@surface/dependency-injection";
import { IRouterInterceptor, NamedRoute, Route } from "@surface/web-router";
import AuthService                               from "../services/auth-service";

export default class AuthRouterInterceptor implements IRouterInterceptor
{
    public constructor(@inject(AuthService) private readonly service: AuthService)
    { }

    public async intercept(next: (route: string | NamedRoute) => Promise<void>, to: Route): Promise<void>
    {
        const isAuthenticated = this.service.getProfile().authenticated;

        if (isAuthenticated && to.name == "login")
        {
            await next({ name: "home" });
        }
        else if (to.meta.requireAuth && !isAuthenticated)
        {
            await next({ name: "login" });
        }
    }
}