// eslint-disable-next-line import/no-unassigned-import
import "@surface/dom-shim";

import type { IConstraint, ITransformer }      from "@surface/router";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import RouteConfigurator                       from "../internal/route-configurator.js";
import type RouteConfiguration                 from "../internal/types/route-configuration.js";
import type IRouteDefinition                   from "../internal/types/route-definition.js";

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

const constraints:  Record<string, IConstraint>  = { UPPERCASE: { validate: x => x == x.toUpperCase() } };
const transformers: Record<string, ITransformer> = { JSON };

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
                component:    User,
                components:   { base: UserBase },
                constraints,
                meta:         { userRead: true },
                name:         "user",
                path:         "user/{id}",
                selector:     "outlet",
                transformers,
            },
        ];

        const expected: IRouteDefinition[] =
        [
            {
                constraints,
                meta:     { userProfileDetailsRead: true },
                name:     "user-profile-details",
                path:     "user/{id}/profile/details",
                selector: "outlet",
                stack:    [new Map([["default", User]]), new Map([["default", UserProfile]]), new Map([["default", UserProfileDetails]])],
                transformers,
            },
            {
                constraints,
                meta:        { userProfileDetailsRead: true },
                name:        "user-nested-root",
                path:        "/user/nested/root",
                selector:    "outlet",
                stack:       [new Map([["default", User]]), new Map([["default", UserProfile]]), new Map([["default", UserNestedRoot]])],
                transformers,
            },
            {
                constraints,
                meta:        { userProfileRead: true },
                name:        "user-profile",
                path:        "user/{id}/profile",
                selector:    "outlet",
                stack:       [new Map([["default", User]]), new Map([["default", UserProfile]])],
                transformers,
            },
            {
                constraints,
                meta:        {  },
                name:        "user-index",
                path:        "user/{id}",
                selector:    "outlet",
                stack:       [new Map([["default", User]]), new Map([["default", UserIndex]])],
                transformers,
            },
            {
                constraints,
                meta:       { userRead: true },
                name:       "user",
                path:       "user",
                selector:   "outlet",
                stack:      [new Map([["default", User]])],
                transformers,
            },
        ];

        const actual = Array.from(RouteConfigurator.configure(routes));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public configureWithoutComponent(): void
    {
        assert.throws(() => Array.from(RouteConfigurator.configure([{ components: { }, path: "/path" }])), Error, "Route \"/path\" requires at least one component");
    }
}
