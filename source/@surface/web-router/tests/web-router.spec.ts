
// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom.js";

import CustomElement, { define, element }      from "@surface/custom-element";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import chaiAsPromised                          from "chai-as-promised";
import type IMiddleware                        from "../internal/interfaces/middleware";
import type IRouteableElement                  from "../internal/interfaces/routeable-element";
import type Route                              from "../internal/types/route";
import type RouteConfiguration                 from "../internal/types/route-configuration";
import WebRouter                               from "../internal/web-router.js";

chai.use(chaiAsPromised);

@element("home-view", "<router-outlet></router-outlet><router-outlet name='non-default'></router-outlet>")
class HomeView extends CustomElement
{
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
        <a #to="'/home'"></a>
        <a #to="'/about'"></a>
        <router-outlet></router-outlet>
    `;

@element("app-root", template)
class AppRoot extends CustomElement
{ }

@suite
export default class WebRouterSpec
{
    private readonly router: WebRouter;

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
                        components: { default: HomeIndexView },
                        path:       "no-outlet",
                        selector:   "#no-outlet",
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

        const middleware: IMiddleware =
        {
            onEnter: (to, _, next) =>
            {
                if (to.meta.requireAuth)
                {
                    next("/home");
                }
            },
        };

        this.router = new WebRouter("app-root", configurations, { baseUrl: "/base/path", middlewares: [middleware] });

        CustomElement.registerDirective(WebRouter.createDirectiveRegistry(this.router));

        document.body.appendChild(new AppRoot());
    }

    @test @shouldPass
    public async push(): Promise<void>
    {
        await this.router.pushCurrentLocation();

        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<HTMLElement>("router-outlet")!;

        chai.assert.instanceOf(slot, HTMLElement);

        await this.router.push("/home");

        chai.assert.equal(window.location.href, "http://localhost.com/base/path/home", "window.location.href equal 'http://localhost.com/base/path/home'");
        chai.assert.instanceOf(slot.firstElementChild, HomeView, "routerView.firstElementChild instanceOf HomeView");

        await this.router.push("/path1");

        chai.assert.equal(window.location.href, "http://localhost.com/base/path/home", "window.location.href equal 'http://localhost.com/base/path/home'");
        chai.assert.equal(slot.firstElementChild, null, "routerView.firstElementChild instanceOf null");
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

        const actual = this.router.route;

        chai.assert.deepEqual(actual, expected);

        await this.router.push("/data/post/2?query=1#hash");

        chai.assert.equal(dataView, slot.firstElementChild, "dataView equal slot.firstElementChild");
        chai.assert.equal(actual.parameters.id, 2, "routeData.parameters.id equal 2");
        chai.assert.notEqual(this.router.route, actual, "dataView.routeData equal routeData");
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

        await new Promise(x => window.setTimeout(x));

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
    public emptyStack(): void
    {
        chai.assert.throw(() => new WebRouter("app", []).route, Error, "Router stack is empty");
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
    }
}