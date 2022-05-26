import chai                                    from "chai";
import type { Manifest }                       from "pacote";
import Mock, { It }                            from "../../packages/@surface/mock/index.js";
import { shouldFail, shouldPass, suite, test } from "../../packages/@surface/test-suite/index.js";
import type { Options }                        from "../internal/depsync.js";
import Depsync                                 from "../internal/depsync.js";
import StrategyType                            from "../internal/enums/strategy-type.js";
import NpmRepository                           from "../internal/npm-repository.js";

const toLookup = (source: Manifest[]): Map<string, Manifest> => new Map(source.map(x => [x.name, x]));

@suite
export default class PublisherSpec
{
    @test @shouldPass
    public async strategyTypeDefault(): Promise<void>
    {
        const actual: Manifest[] =
        [
            { dependencies: { b: "0.0.0" }, dist: { tarball: "" }, name: "a", version: "2.0.0" },
            { dependencies: { c: "0.0.0" }, dist: { tarball: "" }, name: "b", version: "1.5.0" },
            { dist: { tarball: "" }, name: "c", version: "1.0.0-alpha.0" },
        ];

        const expected: Manifest[] =
        [
            { dependencies: { b: "1.5.0" }, dist: { tarball: "" }, name: "a", version: "2.0.0" },
            { dependencies: { c: "1.0.0-alpha.0" }, dist: { tarball: "" }, name: "b", version: "1.5.0" },
            { dist: { tarball: "" }, name: "c", version: "1.0.0-alpha.0" },
        ];

        const manifestMock      = Mock.instance<Manifest>();
        const npmRepositoryMock = new Mock(new NpmRepository());

        manifestMock.setupGet("version").returns("0.5.0");

        npmRepositoryMock.setup("get").call(It.any())
            .returns(Promise.resolve(manifestMock.proxy as Manifest));

        const options: Options = { silent: true };

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual as Manifest[]), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async strategyTypeDefaultWithPackages(): Promise<void>
    {
        const actual: Manifest[] =
        [
            { dependencies: { b: "0.0.0", c: "0.0.0" }, dist: { tarball: "" }, name: "a", version: "2.0.0"  },
            { dependencies: { c: "0.0.0" },             dist: { tarball: "" }, name: "b", version: "1.5.0" },
            { dist: { tarball: "" }, name: "c", version: "1.0.0-alpha.0" },
        ];

        const expected: Manifest[] =
        [
            { dependencies: { b: "1.5.1", c: "1.0.0-alpha.0" }, dist: { tarball: "" }, name: "a", version: "2.0.1" },
            { dependencies: { c: "1.0.0-alpha.0" },             dist: { tarball: "" }, name: "b", version: "1.5.1" },
            { dist: { tarball: "" }, name: "c", version: "1.0.0-alpha.0" },
        ];

        const aManifestMock = Mock.instance<Manifest>();
        aManifestMock.setupGet("version").returns(actual[0]!.version);

        const bManifestMock = Mock.instance<Manifest>();
        bManifestMock.setupGet("version").returns(actual[1]!.version);

        const npmRepositoryMock = new Mock(new NpmRepository());

        npmRepositoryMock.setup("get").call("a@latest")
            .returns(Promise.resolve(aManifestMock.proxy));

        npmRepositoryMock.setup("get").call("b@latest")
            .returns(Promise.resolve(bManifestMock.proxy));

        npmRepositoryMock.setup("get").call("c@latest")
            .returns(Promise.resolve(null));

        const options: Options = { silent: true };

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async strategyTypeDefaultWithVersion(): Promise<void>
    {
        const actual: Manifest[] =
        [
            { dependencies: { b: "1.5.0" },         dist: { tarball: "" }, name: "a", version: "2.0.0" },
            { dependencies: { c: "1.0.0-alpha.0" }, dist: { tarball: "" }, name: "b", version: "1.5.0" },
            { dist: { tarball: "" }, name: "c", version: "1.0.0-alpha.0" },
        ];

        const expected: Manifest[] =
        [
            { dependencies: { b: "1.5.1" }, dist: { tarball: "" }, name: "a", version: "2.2.0" },
            { dependencies: { c: "1.2.0" }, dist: { tarball: "" }, name: "b", version: "1.5.1" },
            { dist: { tarball: "" }, name: "c", version: "1.2.0" },
        ];

        const bGetDataMock = Mock.instance<Manifest>();
        bGetDataMock.setupGet("version").returns(actual[1]!.version);

        const npmRepositoryMock = new Mock(new NpmRepository());

        npmRepositoryMock.setup("get").call("b@latest")
            .returns(Promise.resolve(bGetDataMock.proxy));

        npmRepositoryMock.setup("get").call(It.any())
            .returns(Promise.resolve(null));

        const options: Options = { silent: true, strategy: StrategyType.Default, version: "*.2.*" };

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async strategyTypeDefaultWithVersionPrerelease(): Promise<void>
    {
        const actual: Manifest[] =
        [
            { dependencies: { b: "1.5.0" },         dist: { tarball: "" }, name: "a", version: "2.0.0" },
            { dependencies: { c: "1.0.0-alpha.0" }, dist: { tarball: "" }, name: "b", version: "1.5.0" },
            { dependencies: { d: "1.0.0" },         dist: { tarball: "" }, name: "c", version: "1.3.0-alpha.0" },
            { dist: { tarball: "" }, name: "d", version: "1.0.0" },
        ];

        const expected: Manifest[] =
        [
            { dependencies: { b: "1.5.1" },         dist: { tarball: "" }, name: "a", version: "2.2.0" },
            { dependencies: { c: "1.3.0-alpha.1" }, dist: { tarball: "" }, name: "b", version: "1.5.1"  },
            { dependencies: { d: "1.2.0" },         dist: { tarball: "" }, name: "c", version: "1.3.0-alpha.1" },
            { dist: { tarball: "" }, name: "d", version: "1.2.0" },
        ];

        const options: Options = { silent: true, strategy: StrategyType.Default, version: "*.2.*-*.*" };

        const bGetDataMock = Mock.instance<Manifest>();
        bGetDataMock.setupGet("version").returns(actual[1]!.version);

        const cGetDataMock = Mock.instance<Manifest>();
        cGetDataMock.setupGet("version").returns(actual[2]!.version);

        const npmRepositoryMock = new Mock(new NpmRepository());

        npmRepositoryMock.setup("get").call("b@latest")
            .returns(Promise.resolve(bGetDataMock.proxy));

        npmRepositoryMock.setup("get").call("c@latest")
            .returns(Promise.resolve(cGetDataMock.proxy));

        npmRepositoryMock.setup("get").call(It.any())
            .returns(Promise.resolve(null));

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async strategyTypeDefaultWithForceUpdate(): Promise<void>
    {
        const actual: Manifest[] =
        [
            { dependencies: { b: "2.0.0" }, dist: { tarball: "" }, name: "a", version: "1.0.0" },
            { dist: { tarball: "" }, name: "b", version: "2.0.0" },
        ];

        const expected: Manifest[] =
        [
            { dependencies: { b: "2.0.0" }, dist: { tarball: "" }, name: "a", version: "2.0.0" },
            { dist: { tarball: "" }, name: "b", version: "2.0.0" },
        ];

        const getDataMock = Mock.instance<Manifest>();
        getDataMock.setupGet("version").returns("2.0.0");

        const npmRepositoryMock = new Mock(new NpmRepository());
        npmRepositoryMock.setup("get").call(It.any())
            .returns(Promise.resolve(getDataMock.proxy));

        const options: Options = { silent: true, strategy: StrategyType.ForceUpdate, version: "2.0.0" };

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async strategyTypeDefaultWithIgnoreDependents(): Promise<void>
    {
        const actual: Manifest[] =
        [
            { dependencies: { b: "1.5.0" },         dist: { tarball: "" }, name: "a", version: "2.0.0" },
            { dependencies: { c: "1.0.0-alpha.0" }, dist: { tarball: "" }, name: "b", version: "1.5.0" },
            { dependencies: { e: "1.0.0" },         dist: { tarball: "" }, name: "c", version: "1.3.0-alpha.0" },
            { dist: { tarball: "" }, name: "e", version: "1.0.0" },
        ];

        const expected: Manifest[] =
        [
            { dependencies: { b: "1.5.0" },         dist: { tarball: "" }, name: "a", version: "2.2.0"          },
            { dependencies: { c: "1.0.0-alpha.0" }, dist: { tarball: "" }, name: "b", version: "1.5.0"          },
            { dependencies: { e: "1.0.0" },         dist: { tarball: "" }, name: "c", version: "1.3.0-alpha.0"  },
            { dist: { tarball: "" }, name: "e", version: "1.2.0" },
        ];

        const options: Options = { silent: true, strategy: StrategyType.IgnoreDependents, version: "*.2.*-*.*" };

        const npmRepositoryMock = new Mock(new NpmRepository());
        npmRepositoryMock.setup("get").call(It.any())
            .returns(Promise.resolve(null));

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async strategyTypeOnlyStableWithVersionPrerelease(): Promise<void>
    {
        const actual: Manifest[] =
        [
            { dependencies: { b: "3.0.0" },         dist: { tarball: "" }, name: "a", version: "3.0.0"  },
            { dependencies: { c: "1.0.0-alpha.0" }, dist: { tarball: "" }, name: "b", version: "3.0.0"  },
            { dist: { tarball: "" }, name: "c", version: "1.0.0-alpha.0" },
        ];

        const expected: Manifest[] =
        [
            { dependencies: { b: "3.0.0" },         dist: { tarball: "" }, name: "a", version: "3.0.0"  },
            { dependencies: { c: "1.0.0-alpha.0" }, dist: { tarball: "" }, name: "b", version: "3.0.0"  },
            { dist: { tarball: "" }, name: "c", version: "1.0.0-alpha.0" },
        ];

        const options: Options = { silent: true, strategy: StrategyType.OnlyStable, version: "3.0.0-*.*" };

        const npmRepositoryMock = new Mock(new NpmRepository());
        npmRepositoryMock.setup("get").call(It.any())
            .returns(Promise.resolve(null));

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async strategyTypeDefaultWithIgnoreDependentsAndOnlyStable(): Promise<void>
    {
        const actual: Manifest[] =
        [
            { dependencies: { b: "1.5.0" },         dist: { tarball: "" }, name: "a", version: "2.0.0"          },
            { dependencies: { c: "1.0.0-alpha.0" }, dist: { tarball: "" }, name: "b", version: "1.5.0"          },
            { dependencies: { e: "1.0.0" },         dist: { tarball: "" }, name: "c", version: "1.3.0-alpha.0"  },
            { dist: { tarball: "" }, name: "e", version: "1.0.0" },
        ];

        const expected: Manifest[] =
        [
            { dependencies: { b: "1.5.0" },         dist: { tarball: "" }, name: "a", version: "3.0.0"         },
            { dependencies: { c: "1.0.0-alpha.0" }, dist: { tarball: "" }, name: "b", version: "3.0.0"         },
            { dependencies: { e: "1.0.0" },         dist: { tarball: "" }, name: "c", version: "1.3.0-alpha.0" },
            { dist: { tarball: "" }, name: "e", version: "3.0.0" },
        ];

        const options: Options = { silent: true, strategy: StrategyType.IgnoreDependents | StrategyType.OnlyStable, version: "3.0.0-*.*" };

        const npmRepositoryMock = new Mock(new NpmRepository());
        npmRepositoryMock.setup("get").call(It.any())
            .returns(Promise.resolve(null));

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async repositoryError(): Promise<void>
    {
        const actual: Manifest[] =
        [
            { dist: { tarball: "" }, name: "a", version: "2.0.0" },
        ];

        const expected = { code: "E401" };

        const npmRepositoryMock = new Mock(new NpmRepository());
        npmRepositoryMock.setup("get").call(It.any())
            .returns(Promise.reject(expected));

        const options: Options = { silent: true, strategy: StrategyType.IgnoreDependents | StrategyType.OnlyStable, version: "3.0.0-*.*" };

        try
        {
            await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();
        }
        catch (error)
        {
            chai.assert.deepEqual(error, expected);
        }
    }
}
