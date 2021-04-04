
// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom.js";

import CustomElement, { define, element }      from "@surface/custom-element";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import chaiAsPromised                          from "chai-as-promised";
import type IRouteableElement                  from "../internal/interfaces/routeable-element";
import type IRouterInterceptor                 from "../internal/interfaces/router-interceptor";
import type NamedRoute                         from "../internal/types/named-route.js";
import type Route                              from "../internal/types/route";
import type RouteConfiguration                 from "../internal/types/route-configuration";
import WebRouter                               from "../internal/web-router.js";

chai.use(chaiAsPromised);

@element("home-view", "<router-outlet></router-outlet><router-outlet name='non-default'></router-outlet>")
class HomeView extends CustomElement
{
    public fullscreen: boolean = false;

    public onEnter(): void
    {
        // Coverage
    }

    public onLeave(): void
    {
        // Coverage
    }

    public onUpdate(): void
    {
        // Coverage
    }
}

@define("home-detail-view")
class HomeDetailView extends HTMLElement
{ }

@define("home-other-detail-view")
class HomeOtherDetailView extends HTMLElement
{ }

@element("home-index-view", "<div id='router-outlet' name='non-default'></div>")
class HomeIndexView extends CustomElement implements IRouteableElement
{ }

@define("home-index-detail-view")
class HomeIndexDetailView extends HTMLElement implements IRouteableElement
{ }

@define("about-invalid")
class AboutInvalidView extends HTMLElement implements IRouteableElement
{ }

@define("data-view")
class DataView extends HTMLElement
{ }

@define("about-view")
class AboutView extends HTMLElement
{ }

const template =
    `
        <template #if="host.fullscreen">
            <a #to="'/home'"></a>
            <a #to="'/about'"></a>
            <router-outlet></router-outlet>
        </template>
        <template #else="host.fullscreen">
            <div>
                Header
            </div>
            <a #to="'/home'"></a>
            <a #to="'/about'"></a>
            <router-outlet></router-outlet>
        </template>
    `;

@element("app-root", template)
class AppRoot extends CustomElement
{
    public fullscreen: boolean = false;
}

@suite
export default class WebRouterSpec
{
    private readonly appRoot: AppRoot;
    private readonly router:  WebRouter;

    public constructor()
    {
        const configurations: RouteConfiguration[] =
        [
            {
                children:
                [
                    {
                        components:
                        {
                            "default":     HomeDetailView,
                            "non-default": () => HomeOtherDetailView,
                        },
                        name:       "home-detail",
                        path:       "detail",
                    },
                    {
                        children:
                        [
                            {
                                components: { "non-default": HomeIndexDetailView },
                                path:       "detail",
                                selector:   "#router-outlet",
                            },
                        ],
                        components: { "non-default": { default: HomeIndexView } },
                        name:       "home-index",
                        path:       "index",
                    },
                    {
                        components: { "non-default": HomeIndexView },
                        path:       "no-outlet-non-default",
                        selector:   "#no-outlet-non-default",
                    },
                    {
                        component: HomeIndexView,
                        path:      "no-outlet",
                        selector:  "#no-outlet",
                    },
                ],
                component: async () => Promise.resolve({ default: HomeView }),
                name:      "home",
                path:      "/home",
            },
            {
                component: async () => Promise.resolve(DataView),
                name:      "data",
                path:      "/data/{action}/{id:Number}",
            },
            {
                children:
                [
                    {
                        component: AboutInvalidView,
                        path:      "invalid",
                    },
                ],
                component: AboutView,
                path:      "/about",
            },
            {
                component: AboutView,
                meta:      { requireAuth: true },
                path:      "/forbidden",
            },
        ];

        class Middleware implements IRouterInterceptor
        {
            public async intercept(next: (route: string | NamedRoute) => Promise<void>, to: Route, _: Route | undefined): Promise<void>
            {
                if (to.meta.requireAuth)
                {
                    await next("/home");
                }
            }
        }

        this.router = new WebRouter("app-root", configurations, { baseUrl: "/base/path", interceptors: [{ intercept: async () => Promise.resolve() },  Middleware] });

        CustomElement.registerDirective("to", this.router.asDirective());

        this.appRoot = document.body.appendChild(new AppRoot());
    }

    @test @shouldPass
    public async push(): Promise<void>
    {
        chai.assert.deepEqual(this.router.route, { meta: { }, name: "", parameters: {}, url: new URL(window.location.href) });

        await this.router.pushCurrentLocation();

        const outlet1 = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        chai.assert.instanceOf(outlet1, HTMLElement);

        await this.router.push("/home");

        chai.assert.equal(window.location.href, "http://localhost.com/base/path/home", "window.location.href equal 'http://localhost.com/base/path/home'");
        chai.assert.instanceOf(outlet1.firstElementChild, HomeView, "routerView.firstElementChild instanceOf HomeView");

        this.appRoot.fullscreen = true;

        await new Promise(x => setTimeout(x));

        const outlet2 = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        chai.assert.isFalse(outlet1.isConnected);
        chai.assert.notEqual(outlet1, outlet2);

        chai.assert.equal(window.location.href, "http://localhost.com/base/path/home", "window.location.href equal 'http://localhost.com/base/path/home'");
        chai.assert.instanceOf(outlet2.firstElementChild, HomeView, "routerView.firstElementChild instanceOf HomeView");

        await this.router.push("/path1");

        chai.assert.equal(window.location.href, "http://localhost.com/base/path/home", "window.location.href equal 'http://localhost.com/base/path/home'");
        chai.assert.equal(outlet2.firstElementChild, null, "routerView.firstElementChild instanceOf null");
    }

    @test @shouldPass
    public async pushWithParameters(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        chai.assert.instanceOf(slot, HTMLElement);

        await this.router.push("/data/post/1?query=1#hash");

        const dataView = slot.firstElementChild as DataView;

        const expected: Route =
        {
            meta:       { },
            name:       "data",
            parameters: { action: "post", id: 1 },
            url:        new URL("http://localhost.com/base/path/data/post/1?query=1#hash"),
        };

        chai.assert.deepEqual(this.router.route, expected);

        await this.router.push("/data/post/2?query=1#hash");

        chai.assert.equal(dataView, slot.firstElementChild, "dataView equal slot.firstElementChild");
        chai.assert.equal(this.router.route.parameters.id, 2, "routeData.parameters.id equal 2");
    }

    @test @shouldPass
    public async pushChildrenRoute(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        chai.assert.instanceOf(slot, HTMLElement);

        await this.router.push("/home");

        const homeSlot      = slot.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;
        const homeOtherSlot = slot.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet[name=non-default]")!;

        chai.assert.equal(window.location.href, "http://localhost.com/base/path/home", "window.location.href equal 'http://localhost.com/base/path/home'");
        chai.assert.instanceOf(slot.firstElementChild, HomeView, "routerSlot.firstElementChild instanceOf HomeView");
        chai.assert.equal(homeSlot.firstElementChild, null, "homeSlot.firstElementChild equal null");
        chai.assert.equal(homeOtherSlot.firstElementChild, null, "homeOtherSlot.firstElementChild equal null");

        await this.router.push("/home/detail");

        chai.assert.equal(window.location.href, "http://localhost.com/base/path/home/detail", "window.location.href equal 'http://localhost.com/base/path/home/detail'");
        chai.assert.instanceOf(homeSlot.firstElementChild, HomeDetailView, "homeSlot.firstElementChild instanceOf HomeDetailView");
        chai.assert.instanceOf(homeOtherSlot.firstElementChild, HomeOtherDetailView, "homeOtherSlot.firstElementChild instanceOf HomeOtherDetailView");

        await this.router.push("/home/index");

        chai.assert.equal(window.location.href, "http://localhost.com/base/path/home/index", "window.location.href equal 'http://localhost.com/base/path/home/index'");
        chai.assert.equal(homeSlot.firstElementChild, null, "homeSlot.firstElementChild equal null");
        chai.assert.instanceOf(homeOtherSlot.firstElementChild, HomeIndexView, "homeOtherSlot.firstElementChild instanceOf HomeIndexView");

        const nonDefaultSlot = homeOtherSlot.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("#router-outlet[name=non-default]")!;

        await this.router.push("/home/index/detail");

        chai.assert.equal(window.location.href, "http://localhost.com/base/path/home/index/detail", "window.location.href equal 'http://localhost.com/base/path/home/index/detail'");
        chai.assert.instanceOf(nonDefaultSlot.firstElementChild, HomeIndexDetailView, "homeSlot.firstElementChild instanceOf HomeIndexDetailView");
    }

    @test @shouldPass
    public async pushToNamedRoute(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        chai.assert.instanceOf(slot, HTMLElement);

        await this.router.push({ hash: "baz", name: "home", query: { bar: ["1", "2"], foo: "foo" } });

        chai.assert.equal(window.location.href, "http://localhost.com/base/path/home?bar=1&bar=2&foo=foo#baz", "window.location.href equal 'http://localhost.com/base/path/home?bar=1&bar=2&foo=foo#baz'");
        chai.assert.instanceOf(slot.firstElementChild, HomeView, "route to HomeView");

        await this.router.push({ name: "not-found" });

        chai.assert.equal(window.location.href, "http://localhost.com/base/path/home?bar=1&bar=2&foo=foo#baz", "window.location.href equal 'http://localhost.com/base/path/home?bar=1&bar=2&foo=foo#baz'");
        chai.assert.equal(slot.firstElementChild, null, "routerView.firstElementChild instanceOf null");
    }

    @test @shouldPass
    public async pushToNamedRouteWithParams(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        chai.assert.instanceOf(slot, HTMLElement);

        await this.router.push({ name: "data", parameters: { action: "index", id: 1 } });

        chai.assert.equal(window.location.href, "http://localhost.com/base/path/data/index/1", "window.location.href equal 'http://localhost.com/base/path/data/index/1'");
        chai.assert.instanceOf(slot.firstElementChild, DataView, "slot.firstElementChild to DataView");

        await this.router.push({ name: "data" });

        chai.assert.equal(window.location.href, "http://localhost.com/base/path/data/index/1", "window.location.href equal 'http://localhost.com/base/path/data/index/1'");
        chai.assert.equal(slot.firstElementChild, null, "routerView.firstElementChild instanceOf null");
    }

    @test @shouldPass
    public async pushHandledByMiddleware(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        chai.assert.instanceOf(slot, HTMLElement);

        await this.router.push("/forbidden");

        chai.assert.equal(window.location.href, "http://localhost.com/base/path/home", "window.location.href equal 'http://localhost.com/base/path/home'");
        chai.assert.instanceOf(slot.firstElementChild, HomeView, "slot.firstElementChild to HomeView");
    }

    @test @shouldPass
    public async backAndForward(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        chai.assert.instanceOf(slot, HTMLElement);

        // @ts-expect-error
        this.router.history = [];

        await this.router.push("/home");

        chai.assert.instanceOf(slot.firstElementChild, HomeView, "push('/home'): slot.firstElementChild instanceOf HomeView");

        await this.router.push("/about");

        chai.assert.instanceOf(slot.firstElementChild, AboutView, "push('/about'): slot.firstElementChild instanceOf AboutView");

        await this.router.back();

        chai.assert.instanceOf(slot.firstElementChild, HomeView, "back: slot.firstElementChild instanceOf HomeView");

        await this.router.back();

        chai.assert.instanceOf(slot.firstElementChild, HomeView, "back: slot.firstElementChild instanceOf HomeView");

        await this.router.forward();

        chai.assert.instanceOf(slot.firstElementChild, AboutView, "forward: slot.firstElementChild instanceOf AboutView");

        await this.router.forward();

        chai.assert.instanceOf(slot.firstElementChild, AboutView, "forward: slot.firstElementChild instanceOf AboutView");
    }

    @test @shouldPass
    public async routeClick(): Promise<void>
    {
        const anchor = document.body.firstElementChild!.shadowRoot!.querySelectorAll("a");
        const slot   = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        anchor[0].click();

        await new Promise(x => window.setTimeout(x));

        chai.assert.instanceOf(slot.firstElementChild, HomeView, "click #to='/home': slot.firstElementChild instanceOf HomeView");

        anchor[1].click();

        await new Promise(x => window.setTimeout(x));

        chai.assert.instanceOf(slot.firstElementChild, AboutView, "click #to='/about': slot.firstElementChild instanceOf AboutView");
    }

    @test @shouldPass
    public async routeClickNewWindow(): Promise<void>
    {
        const anchor = document.body.firstElementChild!.shadowRoot!.querySelectorAll("a");
        const slot   = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        chai.assert.equal(windows.length, 1);

        anchor[0].click();

        await new Promise(x => window.setTimeout(x));

        chai.assert.instanceOf(slot.firstElementChild, HomeView, "click #to='/home': slot.firstElementChild instanceOf HomeView");

        anchor[0].dispatchEvent(new MouseEvent("click", { ctrlKey: true }));

        await new Promise(x => window.setTimeout(x));

        chai.assert.equal(windows.length, 2);

        chai.assert.instanceOf(slot.firstElementChild, HomeView, "click #to='/home': slot.firstElementChild instanceOf HomeView");
    }

    @test @shouldFail
    public async invalidElement(): Promise<void>
    {
        await chai.assert.isRejected(this.router.push("/about/invalid"), Error, "Routeable component requires an open shadowRoot");
    }

    @test @shouldFail
    public async cannotFindOutlet(): Promise<void>
    {
        await chai.assert.isRejected(this.router.push("/home/no-outlet"), Error, "Cannot find outlet by provided selector \"#no-outlet\"");
        await chai.assert.isRejected(this.router.push("/home/no-outlet-non-default"), Error, "Cannot find outlet by provided selector \"#no-outlet-non-default[name=non-default]\"");
    }
}