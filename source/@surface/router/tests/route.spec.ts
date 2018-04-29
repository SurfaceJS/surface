import { shouldPass, suite, test} from "@surface/test-suite";
import { expect }                 from "chai";
import Route                      from "../internal/route";

@suite
export default class RouteSpec
{
    @test @shouldPass
    public withoutPattern(): void
    {
        const actual = new Route("default", "").match("/home");

        expect(actual).to.deep.equal(null);
    }

    @test @shouldPass
    public withPattern(): void
    {
        const actual = new Route("default", "/home").match("/home");
        const expected =
        {
            match:  "/home",
            params: { },
            root:   "/home",
            route:  "/home",
            search: null
        };

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public checkProperties(): void
    {
        const route = new Route("default", "/home");

        expect(route.isDefault,  "route.isDefault").to.deep.equal(false);
        expect(route.expression, "route.expression").to.deep.equal(/^\/?home\/?$/i);
        expect(route.name,       "route.name").to.deep.equal("default");
        expect(route.pattern,    "route.pattern").to.deep.equal("/home");
    }

    @test @shouldPass
    public withWildcard(): void
    {
        const actual = new Route("default", "*").match("/home");
        const expected =
        {
            match:  "*",
            params: { },
            root:   "/",
            route:  "/home",
            search: null
        };

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public withParameter(): void
    {
        const actual = new Route("default", "{controller}").match("/home");
        const expected =
        {
            match:  "{controller}",
            params: { controller: "home" },
            root:   "/",
            route:  "/home",
            search: null
        };

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public withParameterAndRoot(): void
    {
        const actual = new Route("default", "/area/{controller}").match("/area/home");
        const expected =
        {
            match:  "/area/{controller}",
            params: { controller: "home" },
            root:   "/area",
            route:  "/area/home",
            search: null
        };

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public withDefaultParameter(): void
    {
        const actual = new Route("default", "{controller=home}").match("/");
        const expected =
        {
            match:  "{controller=home}",
            params: { controller: "home" },
            root:   "/",
            route:  "/",
            search: null
        };

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public withMultiplesParameters(): void
    {
        const actual = new Route("default", "{controller}/{action}/{id}").match("/home/index/1");
        const expected =
        {
            match:  "{controller}/{action}/{id}",
            params: { controller: "home", action: "index", id: "1" },
            root:   "/",
            route:  "/home/index/1",
            search: null
        };

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public withMultiplesParametersAndWildCard(): void
    {
        const actual = new Route("default", "*/{controller}/{action}/{id}").match("/area/home/index/1");
        const expected =
        {
            match:  "*/{controller}/{action}/{id}",
            params: { controller: "home", action: "index", id: "1" },
            root:   "/",
            route:  "/area/home/index/1",
            search: null
        };

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public withMultiplesParametersAndWildCardAndDefaultsAndOptional(): void
    {
        const actual = new Route("default", "*/{controller=home}/{action=index}/{id?}").match("/area");
        const expected =
        {
            match:  "*/{controller=home}/{action=index}/{id?}",
            params: { controller: "home", action: "index", id: undefined },
            root:   "/",
            route:  "/area",
            search: null
        };

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public withQueryString(): void
    {
        const actual = new Route("default", "*/{controller=home}/{action=index}").match("/area/home/index?id=1&name=foo");
        const expected =
        {
            match:  "*/{controller=home}/{action=index}",
            params: { controller: "home", action: "index" },
            root:   "/",
            route:  "/area/home/index?id=1&name=foo",
            search: { id: "1", name: "foo" }
        };

        expect(actual).to.deep.equal(expected);
    }
}