import { RouteConfiguration } from "@surface/web-router";

const routes: RouteConfiguration[] =
[
    { component: async () => import("./views/account-create"), name: "account-create", path: "/account/create" },
    { component: async () => import("./views/account-edit"),   name: "account-edit",   path: "/account/edit/{id}", meta: { requireAuth: true } },
    { component: async () => import("./views/home"),           name: "home",           path: "/",                  meta: { requireAuth: true } },
    { component: async () => import("./views/login"),          name: "login",          path: "/login" },
];

export default routes;