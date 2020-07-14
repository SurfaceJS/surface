// tslint:disable-next-line: no-import-side-effect
import "./fixtures/dom";

import CustomElement, { define, element }      from "@surface/custom-element";
import { inject }                              from "@surface/dependency-injection";
import { RouteData }                           from "@surface/router";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import RouterSlot                              from "../internal/router-slot";
import RouteConfiguration                      from "../internal/types/route-configuration";
import ViewRouter                              from "../internal/view-router";

@element("home-view", "<router-slot></router-slot><router-slot name='other-slot'></router-slot>")
class HomeView extends CustomElement
{ }

@define("home-detail-view")
class HomeDetailView extends HTMLElement
{ }

@define("home-other-detail-view")
class HomeOtherDetailView extends HTMLElement
{ }

@define("home-index-view")
class HomeIndexView extends HTMLElement
{ }

@define("data-view")
class DataView extends HTMLElement
{
    @inject(ViewRouter.ROUTE_DATA_KEY)
    public routeData!: RouteData;
}

@define("about-view")
class AboutView extends HTMLElement
{ }

const configurations: Array<RouteConfiguration> =
    [
        {
            name:      "home",
            path:      "/home",
            component: () => Promise.resolve({ default: HomeView }),
            children:
            [
                {
                    name: "home-detail",
                    path: "detail",
                    components:
                    {
                        "other-slot": () => HomeOtherDetailView,
                        "default":    HomeDetailView,
                    },
                },
                {
                    name:      "home-index",
                    path:      "index",
                    component: { default: HomeIndexView },
                },
            ]
        },
        {
            name:      "data",
            path:      "/data/{action}/{id:Number}",
            component: () => Promise.resolve(DataView),
        },
        {
            path:      "/about",
            component: AboutView,
            children:
            [
                {
                    path:      "invalid",
                    component: HTMLElement
                }
            ]
        },
    ];

const template =
    `
        <a #to="'/home'"></a>
        <a #to="'/about'"></a>
        <router-slot></router-slot>
    `;

@element("app-root", template)
class AppRoot extends CustomElement
{ }

@suite
export default class ViewRouterSpec
{
    private readonly router!: ViewRouter;

    public constructor()
    {
        ViewRouter.registerDirective(this.router = new ViewRouter("app-root", configurations));

        document.body.appendChild(new AppRoot());
    }

    @test @shouldPass
    public async push(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot")!;

        assert.instanceOf(slot, RouterSlot);

        await this.router.push("/home");

        assert.equal(window.location.href, "http://localhost.com/home", "window.location.href equal 'http://localhost.com/home'");
        assert.instanceOf(slot.firstElementChild, HomeView, "routerView.firstElementChild instanceOf HomeView");

        await this.router.push("/path1");

        assert.equal(window.location.href, "http://localhost.com/home", "window.location.href equal 'http://localhost.com/home'");
        assert.equal(slot.firstElementChild, null, "routerView.firstElementChild instanceOf null");
    }

    @test @shouldPass
    public async pushChildrenRoute(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot")!;

        assert.instanceOf(slot, RouterSlot);

        await this.router.push("/home");

        const homeSlot      = slot.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot")!;
        const homeOtherSlot = slot.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot[name=other-slot]")!;

        assert.equal(window.location.href, "http://localhost.com/home", "window.location.href equal 'http://localhost.com/home'");
        assert.instanceOf(slot.firstElementChild, HomeView, "routerSlot.firstElementChild instanceOf HomeView");
        assert.equal(homeSlot.firstElementChild, null, "homeSlot.firstElementChild equal null");
        assert.equal(homeOtherSlot.firstElementChild, null, "homeOtherSlot.firstElementChild equal null");

        await this.router.push("/home/detail");

        assert.equal(window.location.href, "http://localhost.com/home/detail", "window.location.href equal 'http://localhost.com/home/detail'");
        assert.instanceOf(homeSlot.firstElementChild, HomeDetailView, "homeSlot.firstElementChild instanceOf HomeDetailView");
        assert.instanceOf(homeOtherSlot.firstElementChild, HomeOtherDetailView, "homeOtherSlot.firstElementChild instanceOf HomeOtherDetailView");

        await this.router.push("/home/index");

        assert.equal(window.location.href, "http://localhost.com/home/index", "window.location.href equal 'http://localhost.com/home/index'");
        assert.instanceOf(homeSlot.firstElementChild, HomeIndexView, "homeSlot.firstElementChild instanceOf HomeIndexView");
        assert.equal(homeOtherSlot.firstElementChild, null, "homeOtherSlot.firstElementChild equal null");
    }

    @test @shouldPass
    public async pushToNamedRoute(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot")!;

        assert.instanceOf(slot, RouterSlot);

        await this.router.push({ name: "home" });

        assert.equal(window.location.href, "http://localhost.com/home", "window.location.href equal 'http://localhost.com/home'");
        assert.instanceOf(slot.firstElementChild, HomeView, "route to HomeView");

        await this.router.push({ name: "not-found" });

        assert.equal(window.location.href, "http://localhost.com/home", "window.location.href equal 'http://localhost.com/home'");
        assert.equal(slot.firstElementChild, null, "routerView.firstElementChild instanceOf null");
    }

    @test @shouldPass
    public async pushToNamedRouteWithParams(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot")!;

        assert.instanceOf(slot, RouterSlot);

        await this.router.push({ name: "data", parameters: { action: "index", id: 1 } });

        assert.equal(window.location.href, "http://localhost.com/data/index/1", "window.location.href equal 'http://localhost.com/data/index/1'");
        assert.instanceOf(slot.firstElementChild, DataView, "route to DataView");

        await this.router.push({ name: "data" });

        assert.equal(window.location.href, "http://localhost.com/data/index/1", "window.location.href equal 'http://localhost.com/data/index/1'");
        assert.equal(slot.firstElementChild, null, "routerView.firstElementChild instanceOf null");
    }

    @test @shouldPass
    public async pushWithInjection(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot")!;

        assert.instanceOf(slot, RouterSlot);

        await this.router.push("/data/post/1");

        const dataView  = slot.firstElementChild as DataView;
        const routeData = dataView.routeData;

        assert.deepEqual(routeData, { path: "/data/post/1", parameters: { action: "post", id: 1 }, hash: "", query: { } });

        await this.router.push("/data/post/2");

        assert.equal(dataView, slot.firstElementChild, "dataView equal slot.firstElementChild");
        assert.equal(dataView.routeData, routeData, "dataView.routeData equal routeData");
        assert.equal(routeData.parameters.id, 2, "routeData.parameters.id equal 2");
    }

    @test @shouldPass
    public async backAndForward(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot")!;

        assert.instanceOf(slot, RouterSlot);

        // @ts-ignore
        this.router.history = [];

        await this.router.push("/home");

        assert.instanceOf(slot.firstElementChild, HomeView, "push('/home'): slot.firstElementChild instanceOf HomeView");

        await this.router.push("/about");

        assert.instanceOf(slot.firstElementChild, AboutView, "push('/about'): slot.firstElementChild instanceOf AboutView");

        await this.router.back();

        assert.instanceOf(slot.firstElementChild, HomeView, "back: slot.firstElementChild instanceOf HomeView");

        await this.router.back();

        assert.instanceOf(slot.firstElementChild, HomeView, "back: slot.firstElementChild instanceOf HomeView");

        await this.router.forward();

        assert.instanceOf(slot.firstElementChild, AboutView, "forward: slot.firstElementChild instanceOf AboutView");

        await this.router.forward();

        assert.instanceOf(slot.firstElementChild, AboutView, "forward: slot.firstElementChild instanceOf AboutView");
    }

    @test @shouldPass
    public async routeClick(): Promise<void>
    {
        const anchor = document.body.firstElementChild!.shadowRoot!.querySelectorAll("a");
        const slot   = document.body.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot")!;

        anchor[0].click();

        await new Promise(x => window.setTimeout(x));

        assert.instanceOf(slot.firstElementChild, HomeView, "click #to='/home': slot.firstElementChild instanceOf HomeView");

        anchor[1].click();

        await new Promise(x => window.setTimeout(x));

        assert.instanceOf(slot.firstElementChild, AboutView, "click #to='/about': slot.firstElementChild instanceOf AboutView");
    }

    @test @shouldPass
    public async routeClickNewWindow(): Promise<void>
    {
        const anchor = document.body.firstElementChild!.shadowRoot!.querySelectorAll("a");
        const slot   = document.body.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot")!;

        assert.equal(windows.length, 1);

        anchor[0].click();

        await new Promise(x => window.setTimeout(x));

        assert.instanceOf(slot.firstElementChild, HomeView, "click #to='/home': slot.firstElementChild instanceOf HomeView");

        anchor[0].dispatchEvent(new MouseEvent("click", { ctrlKey: true }));

        await new Promise(x => window.setTimeout(x));

        assert.equal(windows.length, 2);

        assert.instanceOf(slot.firstElementChild, HomeView, "click #to='/home': slot.firstElementChild instanceOf HomeView");
    }

    @test @shouldFail
    public async invalidElement(): Promise<void>
    {
        try
        {
            await this.router.push("/about/invalid");
        }
        catch (error)
        {
            assert.equal((error as Error).message, "Route component requires an open shadowRoot");
        }
    }
}