import CustomElement, { element }       from "@surface/custom-element";
import { inject }                       from "@surface/dependency-injection";
import WebRouter, { IRouteableElement } from "@surface/web-router";
import Loading                          from "../../components/app-loading";
import MessageDialog                    from "../../components/app-message-dialog";
import Localization                     from "../../locales/localization";
import AuthService                      from "../../services/auth-service";
import template                         from "./index.html";
import style                            from "./index.scss";

@element("login-view", template, style)

export default class Login extends CustomElement implements IRouteableElement
{
    public model =
    {
        email:    "",
        password: "",
    };

    public errors =
    {
        email:    "",
        password: "",
    };


    public constructor
    (
        @inject(WebRouter)    private readonly router:       WebRouter,
        @inject(AuthService)  private readonly authService:  AuthService,
        @inject(Localization) public readonly  localization: Localization,
    )
    {
        super();
    }

    public isModelValid(): boolean
    {
        let isValid = true;

        if (!this.model.email)
        {
            this.errors.email = "Required field";

            isValid = false;
        }

        if (!this.model.password)
        {
            this.errors.password = "Required field";

            isValid = false;
        }

        return isValid;
    }

    public async login(): Promise<void>
    {
        if (this.isModelValid())
        {
            try
            {
                Loading.show();

                if (await this.authService.signIn(this.model))
                {
                    Loading.close();

                    await this.router.push({ name: "home" });
                }
                else
                {
                    Loading.close();

                    await MessageDialog.show("Info", "Usuário ou senha inválida");
                }
            }
            catch (error)
            {
                Loading.close();

                await MessageDialog.show("Error", error.message);
            }
        }
    }
}