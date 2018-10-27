import Dictionary                                from "@surface/collection/dictionary";
import { Constructor, Func1, Indexer, Nullable } from "@surface/core";
import Enumerable                                from "@surface/enumerable";
import Type                                      from "@surface/reflection";
import Router                                    from "@surface/router";
import View                                      from "@surface/view";
import ViewHost                                  from "@surface/view-host";

/**
 * Handles web client navigation.
 */
export default class ViewManager
{
    private static _instance: Nullable<ViewManager>;
    public static get instance(): Nullable<ViewManager>
    {
        return this._instance;
    }

    private readonly moduleLoader: Func1<string, Promise<object>>;
    private readonly router:       Router;
    private readonly views:        Dictionary<string, View>;

    private readonly _viewHost: ViewHost;
    public get viewHost(): ViewHost
    {
        return this._viewHost;
    }

    private constructor(viewHost: ViewHost, router: Router, moduleLoader: Func1<string, Promise<object>>)
    {
        this._viewHost    = viewHost;
        this.moduleLoader = moduleLoader;

        this.views  = new Dictionary<string, View>();
        this.router = router;

        window.onpopstate = async () => await this.routeTo(window.location.pathname + window.location.search);
    }

    public static configure(viewHost: ViewHost, router: Router, moduleLoader: Func1<string, Promise<object>>): ViewManager
    {
        return ViewManager._instance = ViewManager._instance || new ViewManager(viewHost, router, moduleLoader);
    }

    private async getView(view: string, path: string): Promise<Constructor<View>>
    {
        const esmodule = await this.moduleLoader(path) as Indexer<Nullable<Constructor<View>>>;

        let constructor: Nullable<Constructor<View>>;

        if (!(constructor = esmodule["default"]))
        {
            if (Type.from(esmodule).extends(View))
            {
                constructor = esmodule as object as Constructor<View>;
            }
            else if (Type.from(esmodule).equals(Object))
            {
                constructor = Enumerable.from(Object.keys(esmodule))
                    .where(x => new RegExp(`^${view}(controller)?$`, "i").test(x) && Type.of(esmodule[x] as Function).extends(View))
                    .select(x => esmodule[x])
                    .firstOrDefault();
            }
        }

        if (constructor)
        {
            return constructor;
        }

        throw new TypeError("can't find an valid subclass of View");
    }

    public async routeTo(route: string): Promise<void>
    {
        const routeData = this.router.match(route);

        if (routeData)
        {
            window.history.pushState(null, routeData.params["view"], route);
            const { view, action } = routeData.params;

            let path = `views/${view}`;

            if (!action || action != "index")
            {
                path = `${path}/${action}`;
            }

            if (!this.views.has(view))
            {
                const viewConstructor = await this.getView(view, path);

                const element = new viewConstructor();

                this.views.set(view, element);
            }

            this._viewHost.view = this.views.get(view);
        }
        else
        {
            throw new Error("invalid route path");
        }
    }
}