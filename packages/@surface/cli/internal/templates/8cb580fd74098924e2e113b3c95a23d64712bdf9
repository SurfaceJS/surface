import "../components/app-button";
import "../components/app-icon";
import "../components/app-image-pick";
import "../components/app-input";
import "../components/app-loading";
import "../components/app-message-dialog";
import "../components/app-text-input";

import CustomElement, { element } from "@surface/custom-element";
import { inject }                 from "@surface/dependency-injection";
import WebRouter                  from "@surface/web-router";
import Store                      from "../store";
import template                   from "./index.html";
import style                      from "./index.scss";
import AuthService                from "../services/auth-service";

@element("app-root", template, style)
export default class App extends CustomElement
{
    public constructor
    (
        @inject(Store)       public readonly  store:       Store,
        @inject(WebRouter)   private readonly router:      WebRouter,
        @inject(AuthService) private readonly authService: AuthService
    )
    {
        super();
    }

    public async logout(): Promise<void>
    {
        await this.authService.signOut();
        await this.router.push("/login");

        this.store.profile.authenticated = false;
    }
}