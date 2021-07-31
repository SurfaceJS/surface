# Summary
* [Introduction](#introduction)
* [Basic setup](#basic-setup)
* [Route Configuration](#route-Configuration)
    * [Synchronous](#synchronous)
    * [Asynchronous](#asynchronous)
    * [Named](#named)
    * [Metadata](#metadata)
    * [Children Route](#children-route)
    * [Multiples Components](#multiples-components)
* [Url Templates](#url-templates)
    * [Parameters](#parameters)
    * [Constraints](#constraints)
    * [Transformers](#transformers)
        * [Custom Constraints and Transformers](#custom-constraints-and-transformers)
    * [Match All](#match-all)
* [Interceptors](#interceptors)
* [Life Cycle Hooks](#life-cycle-hooks)
* [Navigation](#navigation)
* [Dependency Injection](#dependency-injection)
* [Directive](#directive)

# Introduction
@surface/web-router enables navigation in your application without the need of page refresh.
Features support for synchronous and asynchronous routes, url templates and native dependency injection.

## Basic setup
```ts
import CustomElement               from "@surface/custom-element";
import type { RouteConfiguration } from "@surface/web-router";
import WebRouter                   from "@surface/web-router";

// <router-outlet> determines where the content will be outputed.
@element("app-root", { template: "<router-outlet></router-outlet>" })
class App extends CustomElement
{ }

document.body.appendChild(new App());

// Component used as view.
@element("home-view")
class HomeView extends CustomElement
{ }

// The router will start looking for the outlet at the shadow root of the app-root component.
const router = new WebRouter("app-root", { routes: [{ component: HomeView, path: "/" }] });

// Navigates to /home.
void router.push("/home");
```

Optionally, you can also provide a base URL.

```ts
const router = new WebRouter("app-root", { baseUrl: "my-app", routes: [{ component: HomeView, path: "/" }] });

// Resolves to "my-app/home" on browser.
void router.push("/home");
```

By default, the router lookups by `<router-outlet>` element where it outputs the resolved component.
This can overrided at configuration level passing the `selector` option.

```ts
import CustomElement               from "@surface/custom-element";
import type { RouteConfiguration } from "@surface/web-router";
import WebRouter                   from "@surface/web-router";

@element("app-root", { template: "<div class='outlet'></div>" })
class App extends CustomElement
{ }

document.body.appendChild(new App());

// Component used as view.
@element("home-view")
class HomeView extends CustomElement
{ }

// The router will start looking for the outlet at the shadow root of the app-root component.
const router = new WebRouter("app-root", { routes: [{ component: HomeView, path: "/", selector: "div.outlet" }] });

// Navigates to /home.
void router.push("/home");
```

## Route Configuration
Route configuration allow us to create routes in some ways.

### Synchronous
Component impoted in synchronous way.
```ts
import type { RouteConfiguration } from "@surface/web-router";
import HomeView                    from "./views/home-view";

const routes: RouteConfiguration[] =
[
    { component: HomeView, path: "/" },
    { component: () => HomeView, path: "/" }, // Lazy, but still synchronous.
];
```

### Asynchronous
Also known as lazy loading. Component is resolved on demand and can be used for code spliting.

```ts
const routes: RouteConfiguration[] =
[
    { component: async () => import("./views/home-view"), path: "/" }, // Resolve to default export
    { component: async () => (await import("./views/home-view")).MyView, path: "/" }, // Using explicit export
];
```
### Named
Named allow us navigate to the route using the name instead the path.

Note that when the route contains mandatory parameters it must also be specified otherwise the route will not match ([see](#parameters)).

```ts
const routes: RouteConfiguration[] =
[
    { component: async () => import("./views/home-view"), path: "/", name: "home" },
    { component: async () => import("./views/home-view"), path: "/foo/{id}", name: "foo" },
];

// Matches: /
void router.push({ name: "home" });

// Matches: foo/1
void router.push({ name: "foo", parameters: { id: 1 } });

// No matches
void router.push({ name: "foo" });
```

### Metadata
Meta is static data provided aside the route that can be access through current route instance.
```ts
const routes: RouteConfiguration[] =
[
    { component: async Home, path: "/", meta: { requiresAuth: false } },
];

// ...
console.log(router.route.meta); // outputs { requiresAuth: false }
```

### Children Route
When using children routes the router only updates the component related to the segment that has changed keeping state of the parent segment.

```ts
const routes: RouteConfiguration[] =
[
    {
        children:
        [
            {
                component: ChildrenA,
                path:      "children-a",
            },
            {
                component: ChildrenB,
                path:      "children-b",
            },
        ],
        component: View,
        path:      "/view",
    }
];

// Outputs View component inside root outlet
void router.push("/view");

// View dont changes. Outputs ChildrenA component inside View outlet;
void router.push("/view/children-a");

// View dont changes. Outputs ChildrenB component inside View outlet.
void router.push("/view/children-b");
```

### Multiples Components
One component can contains multiples named outlets handled by one single route.
The property `components` allows specifies where each component outputs.

```ts
const routes: RouteConfiguration[] =
[
    {
        components:
        {
            default: Home,        // <router-outlet></router-outlet>
            details: HomeDetails, // <router-outlet name="details"></router-outlet>
        },
        path: "/",
    }
];

// Outputs View component inside root outlet
void router.push("/view");

// View dont changes. Outputs ChildrenA component inside View outlet;
void router.push("/view/children-a");

// View dont changes. Outputs ChildrenB component inside View outlet.
void router.push("/view/children-b");
```

## Url Templates
Url Templates can be used to provide additional information about the route.

### Parameters
The most simple example is url parameters.

```ts
const routes: RouteConfiguration[] =
[
    { components: User, path: "/path-1/{id}" },
    { components: User, path: "/path-2/{id?}" }, // Parameter also can be optional
    { components: User, path: "/path-3/{id=0}" }, // Sets a default value when the optional segment is omited.
];
```

When the router or the browser navigate to the some of the mapped URLs, the router's active route will have the mapped parameter available.

The URL http://localhost/path-1/42 will produces some like:
```ts
{ id: "42" }
```

The URL http://localhost/path-2 will produces some like:
```ts
{ }
```

The URL http://localhost/path-3 will produces some like:
```ts
{ id: "0" }
```

### Constraints
Constrains are used to restrict match to exact pattern expected by parameter.
The builtin constraints are: `UUID`, `Alpha`, `Number`, `Boolean` and `Date`.

```ts
const routes: RouteConfiguration[] =
[
    { components: User, path: "/user/{id:Alpha}" },
];
```

Using above configuration.

The URL https://localhost/user/xyz will match, while https://localhost/user/41 will not.

### Transformers
By default all parameters are captured like string. But if you need some kind of transformation, transformers can be used.

The builtin transformer are: `Number`, `Boolean` and `Date`.

```ts
const routes: RouteConfiguration[] =
[
    { components: User, path: "/user/{id:Number}" },
    { components: User, path: "/user/{id:Number?}" } // Optional,
    { components: User, path: "/user/{id:Number=0}" } // With Default value,
];
```

The URL http://localhost/user/42 will produces some like:
```ts
{ id: 42 }
```

### Custom Constraints and Transformers
You also can provide your own custom constraints implementeing the interface `IRouteParameterConstraints` and/or custom transformers implementeing the interface IRouteParameterTransformers` and registering on the router instance.

```ts
import type { IRouteParameterConstraint, IRouteParameterTransformer } from "@surface/web-router";
import WebRouter                                                      from "@surface/web-router";

const arrayTransformer: IRouteParameterConstraint & IRouteParameterTransformer =
{
    parse:     value => value.split(","),
    stringify: value => value.join(),
    validate:  value => value.includes(","),
};

const routes: RouteConfiguration[] =
[
    { components: User, path: "/user/{id:Array}" },
];

const router = new WebRouter("app-root", { routes, transformers: { Array: arrayTransformer } });
```

## Match All
Matches any segment between placeholder patterns.

```ts
const routes: RouteConfiguration[] =
[
    { components: User, path: "/user/{*rest}/details" },
];
```

The URL http://localhost/user/some/deep/path/details/ will produces some like:
```ts
console.log(router.route.parameters); // outputs { rest: "some/deep/path" }
```

## Interceptors
Interceptors can be used to guard some routes and re-route when needed.

```ts
import type { IRouterInterceptor } from "@surface/web-router";
import { authService }             from "./singletons";

class Interceptor implements IRouterInterceptor
{
    public async intercept(next: (route: string | NamedRoute) => Promise<void>, to: Route, from: Route | undefined): Promise<void>
    {
        if (to.meta.requireAuth && !authService.authenticated)
        {
            // Re-routes to login if not authenticated.
            await next("/login");
        }
    }
}

const routes: RouteConfiguration[] =
[
    { component: async () => import("./views/home"),  path: "/", meta: { requireAuth: true } },
    { component: async () => import("./views/login"), path: "/login" },
];

const router = new WebRouter("app-root", { interceptors: [Interceptor], routes });
```
### Life Cycle Hooks
Besides interceptor, some hooks also can be used to handle some route life cycles.

```ts
export default interface IRouteableElement extends HTMLElement, Partial<IDisposable>
{
    // Called when entering on new route
    onRouteEnter?(to: Route, from?: Route): void;
    // Called when leaving on new route
    onRouteLeave?(to: Route, from?: Route): void;
    // Called when the route parameters changes
    onRouteUpdate?(to: Route, from?: Route): void;
    // Called when the element is discarded
    dispose?(): void;
}
```
## Navigation
It is possible to navigate between routes using url, named routes or router history.
```ts
const routes: RouteConfiguration[] =
[
    { component: async () => import("./views/company"), path: "/company/{id}", name: "company" }
];

// Pushs to window.location.href
await router.pushCurrentLocation();

await router.push("/company/1?show-employees=true#details");
// Equivalent to
await router.push({ name: "company", parameters: { id: 1 }, query: { "show-employees": "true" }, hash: "details" });

// Go back one step in history
await router.back();

// Advance one step in history.
await router.forward();

// Go back two steps in history
await router.go(-2);

// Advance two steps in history.
await router.go(2);

// Replaces current entry in history
await router.replace("/company/2");
```
## Dependency Injection
**@surface/web-router** has builtin support of dependency injection through of module [**@surface/dependency-injection**](../dependency-injection/readme.md) and can inject dependencies directly on routed component constructor or properties (notes that injected properties are initialized after constructor).

```ts
import CustomElement               from "@surface/custom-element";
import Container, { inject }       from "@surface/dependency-injection";
import type { RouteConfiguration } from "@surface/web-router";
import WebRouter                   from "@surface/web-router";

@element("home-view")
class HomeView extends CustomElement
{
    @inject(MyOtherService)
    private readonly otherService!: MyOtherService;

    public constructor(@inject(MyService) private readonly service: MyService)
    {
        super();
    }
}

const container = new Container();

container.registerSingleton(MyService);
container.registerSingleton(MyOtherService);

const router = new WebRouter("app-root", { container, routes: [{ component: HomeView, path: "/" }] });

// Creates the app element using the container and then routes to the current location
void import("./app")
    .then(x => document.body.appendChild(container.inject(x.default)))
    .then(() => void router.pushCurrentLocation());
```

## Directive
**@surface/web-router** provides a custom directive that allows you to create router links directly in html and accepts the same arguments that `router.push(...)`.

```ts
import CustomElement                      from "@surface/custom-element";
import WebRouter, { RouterLinkDirective } from "@surface/web-router";
import routes                             from "./routes";

const router = new WebRouter({ root: "app-root", routes });

// Register directive
CustomElement.registerDirective("router-link", context => new RouterLinkDirective(router, context));

void import("./app").then(() => void router.pushCurrentLocation());
```

```html
<a #router-link="'/components/users'">Users</a>
<a #router-link="{ name: 'companies' }">Companies</a>
```