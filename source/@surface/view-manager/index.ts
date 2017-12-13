import "@surface/reflection/extensions";

import { Dictionary }                   from "@surface/collection";
import { load }                         from "@surface/lazy-loader";
import { Router }                       from "@surface/router";
import { Nullable, Constructor, Func1 } from "@surface/types";
import { View }                         from "@surface/view";
import { ViewHost }                     from "@surface/view-host";

/**
 * Handles web client navigation.
 */
export class ViewManager
{
    private static _instance: Nullable<ViewManager>;
    public static get instance(): Nullable<ViewManager>
    {
        return this._instance;
    }

    private _views:  Dictionary<string, View>;
    private _router: Router;

    private _viewHost: ViewHost;
    public get viewHost(): ViewHost
    {
        return this._viewHost;
    }

    private _moduleResolver?: Func1<string, Promise<Object>>;

    private constructor(viewHost: ViewHost, router: Router, moduleResolver?: Func1<string, Promise<Object>>)
    {
        this._views        = new Dictionary<string, View>();
        this._viewHost     = viewHost;
        this._router       = router;
        this._moduleResolver = moduleResolver;

        window.onpopstate = () => this.routeTo(window.location.pathname + window.location.search);
    }

    public static configure(viewHost: ViewHost, router: Router): ViewManager;
    public static configure(viewHost: ViewHost, router: Router, moduleResolver: Func1<string, Promise<Object>>): ViewManager;
    public static configure(viewHost: ViewHost, router: Router, moduleResolver?: Func1<string, Promise<Object>>): ViewManager
    {
        return ViewManager._instance = ViewManager._instance || new ViewManager(viewHost, router, moduleResolver);
    }

    private async getView(view: string, path: string): Promise<Constructor<View>>
    {
        let esmodule = await (this._moduleResolver && this._moduleResolver(path) || load(path));

        let viewConstructor = esmodule["default"] as Nullable<Constructor> || esmodule.reflect()
            .getConstructors()
            .firstOrDefault(x => new RegExp(`^${view}(view)?$`, "i").test(x.name));

        if (viewConstructor && viewConstructor.prototype instanceof View)
        {
            return viewConstructor as Constructor<View>;
        }

        throw new TypeError("Constructor is not an valid subclass of @surface/view-handler/view.");
    }

    public async routeTo(route: string): Promise<void>
    {
        let routeData = this._router.match(route);

        if (routeData)
        {
            window.history.pushState(null, routeData.params["view"], route);
            let { view, action } = routeData.params;

            let path = `views/${view}`;

            if (!action || action != "index")
            {
                path = `${path}/${action}`;
            }

            if (!this._views.has(view))
            {
                let viewConstructor = await this.getView(view, path);
                this._views.set(view, new viewConstructor());
            }

            this._viewHost.view = this._views.get(view);
        }
        else
        {
            throw new Error("Invalid route path");
        }
    }
}