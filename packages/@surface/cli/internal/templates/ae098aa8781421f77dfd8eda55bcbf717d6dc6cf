import { uuidv4 }                       from "@surface/core";
import CustomElement, { element }       from "@surface/custom-element";
import { inject }                       from "@surface/dependency-injection";
import WebRouter, { IRouteableElement } from "@surface/web-router";
import Loading                          from "../../components/app-loading";
import MessageDialog                    from "../../components/app-message-dialog";
import Localization                     from "../../locales/localization";
import AuthService                      from "../../services/auth-service";
import User                             from "../../types/user";
import template                         from "./index.html";
import style                            from "./index.scss";

@element("account-create-view", template, style)

export default class AccountCreate extends CustomElement implements IRouteableElement
{
    public confirmPassword = "";

    public errors =
    {
        confirmPassword: "",
        email:           "",
        name:            "",
        password:        "",
    };

    public model: User =
    {
        id:       uuidv4(),
        email:    "",
        image:    "",
        name:     "",
        password: "",
    }

    public constructor
    (
        @inject(WebRouter)    private readonly router:       WebRouter,
        @inject(AuthService)  private readonly service:      AuthService,
        @inject(Localization) private readonly localization: Localization,
    )
    {
        super();
    }

    public isModelValid(): boolean
    {
        let isValid = true;

        if (!this.model.name)
        {
            this.errors.name = this.localization.requiredField;

            isValid = false;
        }

        if (!this.model.email)
        {
            this.errors.email = this.localization.requiredField;

            isValid = false;
        }

        if (!this.model.password)
        {
            this.errors.password = this.localization.requiredField;

            isValid = false;
        }

        if (!this.confirmPassword)
        {
            this.errors.confirmPassword = this.localization.requiredField;

            isValid = false;
        }

        if (this.confirmPassword != this.model.password)
        {
            this.errors.confirmPassword = "Password's don't match";

            isValid = false;
        }

        return isValid;
    }

    public async save(): Promise<void>
    {
        if (this.isModelValid())
        {
            try
            {
                Loading.show();

                if (await this.service.getByEmail(this.model.email))
                {
                    Loading.close();

                    await MessageDialog.show("Info", `There is already a user with the email ${this.model.email}`);
                }
                else
                {
                    await this.service.create(this.model);

                    Loading.close();

                    await MessageDialog.show("Info", "User successful created!!!");

                    await this.router.push({ name: "login" });

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