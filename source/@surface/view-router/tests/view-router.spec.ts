// tslint:disable-next-line: no-import-side-effect
import "./fixtures/dom";

import CustomElement, { define, element } from "@surface/custom-element";
import { inject }                         from "@surface/dependency-injection";
import { RouteData }                      from "@surface/router";
import { before, suite, test }            from "@surface/test-suite";
import { assert }                         from "chai";
import IRouteConfig                       from "../internal/interfaces/route-config";
import RouterSlot                         from "../internal/router-slot";
import ViewRouter                         from "../internal/view-router";

@define("home-view")
class HomeView extends HTMLElement
{ }

@define("home-detail-view")
class HomeDetailView extends HTMLElement
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

const routes: Array<IRouteConfig> =
    [
        {
            name:      "home",
            path:      "/home",
            component: () => Promise.resolve({ default: HomeView }),
        },
        {
            name:      "data",
            path:      "/data/{action}/{id:Number}",
            component: () => Promise.resolve(DataView),
        },
        {
            name:      "home-detail",
            path:      "/home/detail",
            slot:      "home-detail",
            component: { default: HomeDetailView },
        },
        {
            name:      "about",
            path:      "/about",
            component: AboutView,
        },
    ];

const router = new ViewRouter(routes);
ViewRouter.registerDirective(router);

const template =
`
    <a #to="'/home'"></a>
    <a #to="'/about'"></a>
    <router-slot></router-slot>
    <router-slot name='home-detail'></router-slot>
`;

@element("app-root", template)
class AppRoot extends CustomElement
{ }

@suite
export default class ViewRouterSpec
{
    @before
    public initialize(): void
    {
        document.body.appendChild(new AppRoot());
    }

    @test
    public async push(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot")!;

        assert.instanceOf(slot, RouterSlot);

        await router.push("/home");

        assert.equal(window.location.href, "http://localhost.com/home", "window.location.href equal 'http://localhost.com/home'");
        assert.instanceOf(slot.firstElementChild, HomeView, "routerView.firstElementChild instanceOf HomeView");

        await router.push("/path1");

        assert.equal(window.location.href, "http://localhost.com/home", "window.location.href equal 'http://localhost.com/home'");
        assert.equal(slot.firstElementChild, null, "routerView.firstElementChild instanceOf null");
    }

    @test
    public async pushUsingScope(): Promise<void>
    {
        const slot           = document.body.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot")!;
        const slotHomeDetail = slot.nextElementSibling!;

        assert.instanceOf(slot, RouterSlot);

        await router.push("/home");

        assert.equal(window.location.href, "http://localhost.com/home", "window.location.href equal 'http://localhost.com/home'");
        assert.instanceOf(slot.firstElementChild, HomeView, "routerSlot.firstElementChild instanceOf HomeView");
        assert.equal(slotHomeDetail.firstElementChild, null, "routerSlotHomeDetail.firstElementChild equal null");

        await router.push("/home/detail");

        assert.equal(window.location.href, "http://localhost.com/home/detail", "window.location.href equal 'http://localhost.com/home/detail'");
        assert.instanceOf(slot.firstElementChild, HomeView, "routerSlot.firstElementChild instanceOf HomeView");
        assert.instanceOf(slotHomeDetail.firstElementChild, HomeDetailView, "route instanceOf HomeDetailView");
    }

    @test
    public async pushToNamedRoute(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot")!;

        assert.instanceOf(slot, RouterSlot);

        await router.push({ name: "home" });

        assert.equal(window.location.href, "http://localhost.com/home", "window.location.href equal 'http://localhost.com/home'");
        assert.instanceOf(slot.firstElementChild, HomeView, "route to HomeView");

        await router.push({ name: "not-found" });

        assert.equal(window.location.href, "http://localhost.com/home", "window.location.href equal 'http://localhost.com/home'");
        assert.equal(slot.firstElementChild, null, "routerView.firstElementChild instanceOf null");
    }

    @test
    public async pushToNamedRouteWithParams(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot")!;

        assert.instanceOf(slot, RouterSlot);

        await router.push({ name: "data", params: { action: "index", id: 1 } });

        assert.equal(window.location.href, "http://localhost.com/data/index/1", "window.location.href equal 'http://localhost.com/data/index/1'");
        assert.instanceOf(slot.firstElementChild, DataView, "route to DataView");

        await router.push({ name: "data" });

        assert.equal(window.location.href, "http://localhost.com/data/index/1", "window.location.href equal 'http://localhost.com/data/index/1'");
        assert.equal(slot.firstElementChild, null, "routerView.firstElementChild instanceOf null");
    }

    @test
    public async pushWithInjection(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot")!;

        assert.instanceOf(slot, RouterSlot);

        await router.push("/data/post/1");

        const dataView = slot.firstElementChild as DataView;

        assert.deepEqual(dataView.routeData, { path: "/data/post/1", params: { action: "post", id: 1 }, hash: "", query: { } });
    }

    @test
    public async backAndForward(): Promise<void>
    {
        const slot = document.body.firstElementChild!.shadowRoot!.querySelector<RouterSlot>("router-slot")!;

        assert.instanceOf(slot, RouterSlot);

        await router.push("/home");

        assert.instanceOf(slot.firstElementChild, HomeView, "push('/home'): slot.firstElementChild instanceOf HomeView");

        await router.push("/about");

        assert.instanceOf(slot.firstElementChild, AboutView, "push('/about'): slot.firstElementChild instanceOf AboutView");

        await router.back();

        assert.instanceOf(slot.firstElementChild, HomeView, "back: slot.firstElementChild instanceOf HomeView");

        await router.forward();

        assert.instanceOf(slot.firstElementChild, AboutView, "forward: slot.firstElementChild instanceOf AboutView");
    }

    @test
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

    @test
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
}