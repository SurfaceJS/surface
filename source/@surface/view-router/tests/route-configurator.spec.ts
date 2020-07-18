// tslint:disable-next-line: no-import-side-effect
import "./fixtures/dom";

import { suite, test }    from "@surface/test-suite";
import { assert }         from "chai";
import RouteConfigurator  from "../internal/route-configurator";
import RouteConfiguration from "../internal/types/route-configuration";
import IRouteDefinition   from "../internal/types/route-definition";

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

@suite
export default class ViewRouterSpec
{
    @test
    public configure(): void
    {
        const routes: Array<RouteConfiguration> =
            [
                {
                    meta:       { userRead: true },
                    path:       "user/{id}",
                    name:       "user",
                    component:  User,
                    components: { base: UserBase },
                    children:
                    [
                        {
                            meta:      { userProfileRead: true },
                            path:      "profile",
                            name:      "user-profile",
                            component: UserProfile,
                            children:
                            [
                                {
                                    meta:      { userProfileDetailsRead: true },
                                    name:      "user-profile-details",
                                    path:      "details",
                                    component: UserProfileDetails
                                }
                            ]
                        },
                        {
                            path:      "",
                            name:      "user-index",
                            component: UserIndex
                        },
                    ]
                }
            ];

        const expected: Array<IRouteDefinition> =
            [
                {
                    meta:  { userProfileDetailsRead: true },
                    name:  "user-profile-details",
                    path:  "user/{id}/profile/details",
                    stack: [new Map([["default", User]]), new Map([["default", UserProfile]]), new Map([["default", UserProfileDetails]])],
                },
                {
                    meta:  { userProfileRead: true },
                    name:  "user-profile",
                    path:  "user/{id}/profile",
                    stack: [new Map([["default", User]]), new Map([["default", UserProfile]])]
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
                }
            ];

        const actual = Array.from(RouteConfigurator.configure(routes));

        assert.deepEqual(actual, expected);
    }
}
