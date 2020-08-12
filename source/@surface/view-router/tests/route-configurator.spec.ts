// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom";

import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import RouteConfigurator                       from "../internal/route-configurator";
import RouteConfiguration                      from "../internal/types/route-configuration";
import IRouteDefinition                        from "../internal/types/route-definition";

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
                            },
                            {
                                component: UserNestedRoot,
                                meta:      { userProfileDetailsRead: true },
                                name:      "user-nested-root",
                                path:      "/user/nested/root",
                            },
                        ],
                        component: UserProfile,
                        meta:      { userProfileRead: true },
                        name:      "user-profile",
                        path:      "profile",
                    },
                    {
                        component: UserIndex,
                        name:      "user-index",
                        path:      "",
                    },
                ],
                component:  User,
                components: { base: UserBase },
                meta:       { userRead: true },
                name:       "user",
                path:       "user/{id}",
            },
        ];

        const expected: IRouteDefinition[] =
        [
            {
                meta:  { userProfileDetailsRead: true },
                name:  "user-profile-details",
                path:  "user/{id}/profile/details",
                stack: [new Map([["default", User]]), new Map([["default", UserProfile]]), new Map([["default", UserProfileDetails]])],
            },
            {
                meta:  { userProfileDetailsRead: true },
                name:  "user-nested-root",
                path:  "/user/nested/root",
                stack: [new Map([["default", User]]), new Map([["default", UserProfile]]), new Map([["default", UserNestedRoot]])],
            },
            {
                meta:  { userProfileRead: true },
                name:  "user-profile",
                path:  "user/{id}/profile",
                stack: [new Map([["default", User]]), new Map([["default", UserProfile]])],
            },
            {
                meta:  {  },
                name:  "user-index",
                path:  "user/{id}",
                stack: [new Map([["default", User]]), new Map([["default", UserIndex]])],
            },
            {
                meta:  { userRead: true },
                name:  "user",
                path:  "user",
                stack: [new Map([["default", User]])],
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