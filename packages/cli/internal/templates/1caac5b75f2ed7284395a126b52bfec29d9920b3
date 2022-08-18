import { painting }                     from "@surface/htmlx";
import HTMLXElement, { element }        from "@surface/htmlx-element";
import { inject }                       from "@surface/dependency-injection";
import WebRouter, { IRouteableElement } from "@surface/web-router";
import Loading                          from "../../components/app-loading/index";
import MessageDialog                    from "../../components/app-message-dialog";
import Localization                     from "../../locales/localization";
import AuthService                      from "../../services/auth-service";
import User                             from "../../types/user";
import template                         from "./index.htmlx";
import style                            from "./index.scss";

@element("account-edit-view", { style, template })

export default class AccountEdit extends HTMLXElement implements IRouteableElement
{
    public errors =
    {
        email:    "",
        name:     "",
        password: "",
    };

    public model: User =
    {
        id:       "",
        image:    "",
        name:     "",
        email:    "",
        password: "",
    }

    private user: User =
    {
        id:       "",
        image:    "",
        name:     "",
        email:    "",
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

    public async onRouteEnter(): Promise<void>
    {
        Loading.show();

        this.user = { ...this.model = (await this.service.getById(this.router.route.parameters.id as string)) as User };

        await painting();

        Loading.close();
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

        return isValid;
    }

    public async save(): Promise<void>
    {
        if (this.isModelValid())
        {
            try
            {
                Loading.show();

                if (this.model.email != this.user.email && await this.service.getByEmail(this.model.email))
                {
                    Loading.close();

                    await MessageDialog.show("Info", `There is already a user with the email ${this.model.email}`);
                }
                else
                {
                    await this.service.update(this.model);

                    Loading.close();

                    await MessageDialog.show("Info", "User successful updated!!!");

                    await this.router.push({ name: "login" });
                }
            }
            catch (error)
            {
                Loading.close();

                await MessageDialog.show("Error", (error as Error).message);
            }
        }
    }
}