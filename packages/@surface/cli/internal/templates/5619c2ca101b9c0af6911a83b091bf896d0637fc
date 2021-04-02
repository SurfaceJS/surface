import CustomElement                     from "@surface/custom-element";
import WebRouter, { RouteConfiguration } from "@surface/web-router";

const routes: RouteConfiguration[] =
[
    { component: async () => import("./views/world"),  name: "home",  path: "/home", },
    { component: async () => import("./views/hello"), name: "about", path: "/about" },
];

const router = new WebRouter("app-root", routes);

CustomElement.registerDirective("to", router.asDirectiveHandler());

void import("./app");