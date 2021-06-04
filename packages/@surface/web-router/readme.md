# Summary
* [Introduction](#introduction)
* [Basic setup](#basic-setup)
* [Route Configuration](#route-Configuration)
    * [Synchronous](#synchronous)
    * [Asynchronous](#asynchronous)
    * [Named](#named)
    * [Metadata](#metadata)
    * [Nested Route](#nested-route)
* [Url Templates](#route-Configuration)
    * [Parameters](#route-Configuration)
        * [Optional](#optional)
        * [Default Value](#default-value)
    * [Transformers](#transformers)
        * [Optional](#optional)
        * [Default Value](#default-value)
    * [Catch All](#catch-all)
* [Interceptors](#interceptors)
* [Navigation](#navigation)
* [Dependency Injection](#dependency-injection)


# Introduction
@surface/web-router enables navigation in your application without the need of page refresh.
Features support for synchronous and asynchronous routes, url templates and native dependency injection.

## Basic setup
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

## Route Configuration
...
### Synchronous
...
### Asynchronous
...
### Named
...
### Metadata
...
### Nested Route
...
## Url Templates
...
### Parameters
...
#### Optional
...
#### Default Value
...
### Transformers
...
#### Optional
...
#### Default Value
...
## Catch All
...
## Interceptors
...
## Navigation
...
## Dependency Injection
...