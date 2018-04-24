import { shouldPass, suite, test} from "@surface/test-suite";
import { expect }                 from "chai";
import Router                     from "..";

@suite
export default class RouterSpec
{
    @test @shouldPass
    public match(): void
    {
        const constructAndMatch = () =>
        {
            new Router()
                .mapRoute("default", "/home", true)
                .match("/home");
        };

        expect(constructAndMatch).to.not.throw();
    }

    @test @shouldPass
    public matchWithCallback(): void
    {
        let matched = false;

        new Router()
            .mapRoute("default", "/home", true)
            .when("/home", () => matched = true)
            .match("/home");

        expect(matched).to.equal(true);
    }

    @test @shouldPass
    public matchDefaultRoute(): void
    {
        let matched = false;

        new Router()
            .mapRoute("default", "/home", true)
            .mapRoute("non-default", "/login", false)
            .when("/", () => matched = true)
            .match("/");

        expect(matched).to.equal(true);
    }

    @test @shouldPass
    public matchWildcard(): void
    {
        let matched = false;

        new Router()
            .mapRoute("default", "/home", true)
            .when("*", () => matched = true)
            .match("/");

        expect(matched).to.equal(true);
    }
}