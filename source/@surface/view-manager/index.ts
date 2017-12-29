import "@surface/reflection/extensions";

import { Dictionary }                   from "@surface/collection";
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

    private _moduleLoader: Func1<string, Promise<Object>>;

    private constructor(viewHost: ViewHost, router: Router, moduleLoader: Func1<string, Promise<Object>>)
    {
        this._views        = new Dictionary<string, View>();
        this._viewHost     = viewHost;
        this._router       = router;
        this._moduleLoader = moduleLoader;

        window.onpopstate = async () => await this.routeTo(window.location.pathname + window.location.search);
    }

    public static configure(viewHost: ViewHost, router: Router, moduleLoader: Func1<string, Promise<Object>>): ViewManager
    {
        return ViewManager._instance = ViewManager._instance || new ViewManager(viewHost, router, moduleLoader);
    }

    private async getView(view: string, path: string): Promise<Constructor<View>>
    {
        let esmodule = await this._moduleLoader(path);

        let constructor: Nullable<Constructor<View>> = esmodule["default"]
            || esmodule.getType().extends(View) && esmodule
            || esmodule.getType().equals(Object) && Object.keys(esmodule)
                .asEnumerable()
                .where(x => new RegExp(`^${view}(view)?$`, "i").test(x) && (esmodule[x] as Object).getType().extends(View))
                .select(x => esmodule[x])
                .firstOrDefault();

        if (constructor)
        {
            return constructor;
        }

        throw new TypeError("Can't find an valid subclass of View.");
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