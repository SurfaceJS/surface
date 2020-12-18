// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom.js";

import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import RouteConfigurator                       from "../internal/route-configurator.js";
import type RouteConfiguration                 from "../internal/types/route-configuration";
import type IRouteDefinition                   from "../internal/types/route-definition";

class User extends HTMLElement
{ }

class UserBase extends HTMLElement
{ }

class UserIndex extends HTMLElement
{ }

class UserProfile extends HTMLElement
{ }

class UserProfileDetails extends HTMLElement
{ }

class UserNestedRoot extends HTMLElement
{ }

@suite
export default class ViewRouterSpec
{
    @test @shouldPass
    public configure(): void
    {
        const routes: RouteConfiguration[] =
        [
            {
                children:
                [
                    {
                        children:
                        [
                            {
                                component: UserProfileDetails,
                                meta:      { userProfileDetailsRead: true },
                                name:      "user-profile-details",
                                path:      "details",
                                selector:  "outlet",
                            },
                            {
                                component: UserNestedRoot,
                                meta:      { userProfileDetailsRead: true },
                                name:      "user-nested-root",
                                path:      "/user/nested/root",
                                selector:  "outlet",
                            },
                        ],
                        component: UserProfile,
                        meta:      { userProfileRead: true },
                        name:      "user-profile",
                        path:      "profile",
                        selector:  "outlet",
                    },
                    {
                        component: UserIndex,
                        name:      "user-index",
                        path:      "",
                        selector:  "outlet",
                    },
                ],
                component:  User,
                components: { base: UserBase },
                meta:       { userRead: true },
                name:       "user",
                path:       "user/{id}",
                selector:   "outlet",
            },
        ];

        const expected: IRouteDefinition[] =
        [
            {
                meta:     { userProfileDetailsRead: true },
                name:     "user-profile-details",
                path:     "user/{id}/profile/details",
                selector: "outlet",
                stack:    [new Map([["default", User]]), new Map([["default", UserProfile]]), new Map([["default", UserProfileDetails]])],
            },
            {
                meta:     { userProfileDetailsRead: true },
                name:     "user-nested-root",
                path:     "/user/nested/root",
                selector: "outlet",
                stack:    [new Map([["default", User]]), new Map([["default", UserProfile]]), new Map([["default", UserNestedRoot]])],
            },
            {
                meta:     { userProfileRead: true },
                name:     "user-profile",
                path:     "user/{id}/profile",
                selector: "outlet",
                stack:    [new Map([["default", User]]), new Map([["default", UserProfile]])],
            },
            {
                meta:     {  },
                name:     "user-index",
                path:     "user/{id}",
                selector: "outlet",
                stack:    [new Map([["default", User]]), new Map([["default", UserIndex]])],
            },
            {
                meta:     { userRead: true },
                name:     "user",
                path:     "user",
                selector: "outlet",
                stack:    [new Map([["default", User]])],
            },
        ];

        const actual = Array.from(RouteConfigurator.configure(routes));

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public configureWithoutComponent(): void
    {
        chai.assert.throws(() => Array.from(RouteConfigurator.configure([{ components: { }, path: "/path" }])), Error, "Route \"/path\" requires at least one component");
    }
}