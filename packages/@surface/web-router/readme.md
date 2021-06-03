@surface/web-router enables navigation in your application without the need of page refresh.
Features support for synchronous and asynchronous routes, url templates and native dependency injection.

Basic configuration:
```ts
import CustomElement               from "@surface/custom-element";
import type { RouteConfiguration } from "@surface/web-router";
import WebRouter                   from "@surface/web-router";

@element("app-root", { template: "<router-outlet></router-outlet>" })
class App extends CustomElement
{ }

@element("home-view")
class HomeView extends CustomElement
{ }

const routes: RouteConfiguration[] =
[
    { component: HomeView, path: "/" }, // Synchronous
    { component: () => HomeView, path: "/home" }, // Synchronous lazy
    { component: async () => import("./views/my-route"), path: "/my-route" } // Asynchronous,
];

document.body.appendChild(new App());

const router = new WebRouter("app-root", routes);

void router.push("/home");
```

<!-- ```ts
import CustomElement                      from "@surface/custom-element";
import type { RouteConfiguration }        from "@surface/web-router";
import WebRouter, { RouterLinkDirective } from "@surface/web-router";

@element("app-root")
class App extends CustomElement
{ }

@element("home-view")
class HomeView extends CustomElement
{ }

const div

const routes: RouteConfiguration[] =
[
    { component: HomeView, path: "/" }, // Synchronous
    { component: () => HomeView, path: "/home" }, // Synchronous lazy
    { component: async () => import("./views/my-route"), path: "/my-route" } // Asynchronous,
];

const router = new WebRouter("app-root", routes);

CustomElement.registerDirective("router-link", context => new RouterLinkDirective(router, context));

// In this example the app references the #router-link directive in its template, so it needs to be set after its registration.
void import("./app")
    .then
    (
        appModule =>
        {
            document.body.appendChild(new appModule.default());

            void router.pushCurrentLocation();
        }
    );
``` -->