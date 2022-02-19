import HTMLXElement                                           from "@surface/htmlx-element";
import WebRouter, { RouteConfiguration, RouterLinkDirective } from "@surface/web-router";

const routes: RouteConfiguration[] =
[
    { component: async () => import("./views/hello"), name: "hello", path: "/hello" },
    { component: async () => import("./views/world"), name: "world", path: "/world" },
];

const router = new WebRouter({ root: "app-root", routes });

HTMLXElement.registerDirective("to", context => new RouterLinkDirective(router, context));

void import("./app");