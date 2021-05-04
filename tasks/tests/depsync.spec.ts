import chai                                    from "chai";
import type { IGetData, IPackage }             from "npm-registry-client";
import Mock, { It }                            from "../../packages/@surface/mock/index.js";
import { shouldFail, shouldPass, suite, test } from "../../packages/@surface/test-suite/index.js";
import type { Options }                       from "../internal/depsync.js";
import Depsync                                 from "../internal/depsync.js";
import StrategyType                            from "../internal/enums/strategy-type.js";
import NpmRepository                           from "../internal/npm-repository.js";

const toLookup = (source: IPackage[]): Map<string, IPackage> => new Map(source.map(x => [x.name, x]));

@suite
export default class PublisherSpec
{
    @test @shouldPass
    public async strategyTypeDefault(): Promise<void>
    {
        const actual: IPackage[] =
        [
            { dependencies: { b: "0.0.0" }, name: "a", version: "2.0.0" },
            { dependencies: { c: "0.0.0" }, name: "b", version: "1.5.0" },
            { name: "c", version: "1.0.0-alpha.0" },
        ];

        const expected: IPackage[] =
        [
            { dependencies: { b: "1.5.0" }, name: "a", version: "2.0.0" },
            { dependencies: { c: "1.0.0-alpha.0" }, name: "b", version: "1.5.0" },
            { name: "c", version: "1.0.0-alpha.0" },
        ];

        const getDataMock       = Mock.instance<IGetData>();
        const npmRepositoryMock = new Mock(new NpmRepository());

        getDataMock.setupGet("versions").returns({ "0.5.0": { } as IPackage });

        npmRepositoryMock.setup("get").call(It.any(), It.any())
            .returns(Promise.resolve(getDataMock.proxy));

        const options: Options = { silent: true };

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async strategyTypeDefaultWithPackages(): Promise<void>
    {
        const actual: IPackage[] =
        [
            { dependencies: { b: "0.0.0", c: "0.0.0" }, name: "a", version: "2.0.0"  },
            { dependencies: { c: "0.0.0" }, name: "b", version: "1.5.0" },
            { name: "c", version: "1.0.0-alpha.0" },
        ];

        const expected: IPackage[] =
        [
            { dependencies: { b: "1.5.1", c: "1.0.0-alpha.0" }, name: "a", version: "2.0.1" },
            { dependencies: { c: "1.0.0-alpha.0" }, name: "b", version: "1.5.1" },
            { name: "c", version: "1.0.0-alpha.0" },
        ];

        const aGetDataMock = Mock.instance<IGetData>();
        aGetDataMock.setupGet("versions").returns({ [actual[0].version]: actual[0] });

        const bGetDataMock = Mock.instance<IGetData>();
        bGetDataMock.setupGet("versions").returns({ [actual[1].version]: actual[2] });

        const npmRepositoryMock = new Mock(new NpmRepository());

        npmRepositoryMock.setup("get").call("a", It.any())
            .returns(Promise.resolve(aGetDataMock.proxy));

        npmRepositoryMock.setup("get").call("b", It.any())
            .returns(Promise.resolve(bGetDataMock.proxy));

        npmRepositoryMock.setup("get").call("c", It.any())
            .returns(Promise.reject({ code: "E404" }));

        const options: Options = { silent: true };

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async strategyTypeDefaultWithVersion(): Promise<void>
    {
        const actual: IPackage[] =
        [
            { dependencies: { b: "1.5.0" },         name: "a", version: "2.0.0" },
            { dependencies: { c: "1.0.0-alpha.0" }, name: "b", version: "1.5.0" },
            { name: "c", version: "1.0.0-alpha.0" },
        ];

        const expected: IPackage[] =
        [
            { dependencies: { b: "1.5.1" }, name: "a", version: "2.2.0" },
            { dependencies: { c: "1.2.0" }, name: "b", version: "1.5.1" },
            { name: "c", version: "1.2.0" },
        ];

        const bGetDataMock = Mock.instance<IGetData>();
        bGetDataMock.setupGet("versions").returns({ [actual[1].version]: actual[1] });

        const npmRepositoryMock = new Mock(new NpmRepository());

        npmRepositoryMock.setup("get").call("b", It.any())
            .returns(Promise.resolve(bGetDataMock.proxy));

        npmRepositoryMock.setup("get").call(It.any(), It.any())
            .returns(Promise.reject({ code: "E404" }));

        const options: Options = { silent: true, strategy: StrategyType.Default, version: "*.2.*" };

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async strategyTypeDefaultWithVersionPrerelease(): Promise<void>
    {
        const actual: IPackage[] =
        [
            { dependencies: { b: "1.5.0" },         name: "a", version: "2.0.0" },
            { dependencies: { c: "1.0.0-alpha.0" }, name: "b", version: "1.5.0" },
            { dependencies: { d: "1.0.0" },         name: "c", version: "1.3.0-alpha.0" },
            { name: "d", version: "1.0.0" },
        ];

        const expected: IPackage[] =
        [
            { dependencies: { b: "1.5.1" },         name: "a", version: "2.2.0" },
            { dependencies: { c: "1.3.0-alpha.1" }, name: "b", version: "1.5.1"  },
            { dependencies: { d: "1.2.0" },         name: "c", version: "1.3.0-alpha.1" },
            { name: "d", version: "1.2.0" },
        ];

        const options: Options = { silent: true, strategy: StrategyType.Default, version: "*.2.*-*.*" };

        const bGetDataMock = Mock.instance<IGetData>();
        bGetDataMock.setupGet("versions").returns({ [actual[1].version]: actual[1] });

        const cGetDataMock = Mock.instance<IGetData>();
        cGetDataMock.setupGet("versions").returns({ [actual[2].version]: actual[2] });

        const npmRepositoryMock = new Mock(new NpmRepository());

        npmRepositoryMock.setup("get").call("b", It.any())
            .returns(Promise.resolve(bGetDataMock.proxy));

        npmRepositoryMock.setup("get").call("c", It.any())
            .returns(Promise.resolve(cGetDataMock.proxy));

        npmRepositoryMock.setup("get").call(It.any(), It.any())
            .returns(Promise.reject({ code: "E404" }));

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async strategyTypeDefaultWithForceUpdate(): Promise<void>
    {
        const actual: IPackage[] =
        [
            { dependencies: { b: "2.0.0" }, name: "a", version: "1.0.0" },
            { name: "b", version: "2.0.0" },
        ];

        const expected: IPackage[] =
        [
            { dependencies: { b: "2.0.0" }, name: "a", version: "2.0.0" },
            { name: "b", version: "2.0.0" },
        ];

        const getDataMock = Mock.instance<IGetData>();
        getDataMock.setupGet("versions").returns({ "2.0.0": { } as IPackage });

        const npmRepositoryMock = new Mock(new NpmRepository());
        npmRepositoryMock.setup("get").call(It.any(), It.any())
            .returns(Promise.resolve(getDataMock.proxy));

        const options: Options = { silent: true, strategy: StrategyType.ForceUpdate, version: "2.0.0" };

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async strategyTypeDefaultWithIgnoreDependents(): Promise<void>
    {
        const actual: IPackage[] =
        [
            { dependencies: { b: "1.5.0" },         name: "a", version: "2.0.0" },
            { dependencies: { c: "1.0.0-alpha.0" }, name: "b", version: "1.5.0" },
            { dependencies: { e: "1.0.0" },         name: "c", version: "1.3.0-alpha.0" },
            { name: "e", version: "1.0.0" },
        ];

        const expected: IPackage[] =
        [
            { dependencies: { b: "1.5.0" },         name: "a", version: "2.2.0"          },
            { dependencies: { c: "1.0.0-alpha.0" }, name: "b", version: "1.5.0"          },
            { dependencies: { e: "1.0.0" },         name: "c", version: "1.3.0-alpha.0"  },
            { name: "e", version: "1.2.0" },
        ];

        const options: Options = { silent: true, strategy: StrategyType.IgnoreDependents, version: "*.2.*-*.*" };

        const npmRepositoryMock = new Mock(new NpmRepository());
        npmRepositoryMock.setup("get").call(It.any(), It.any())
            .returns(Promise.reject({ code: "E404" }));

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async strategyTypeOnlyStableWithVersionPrerelease(): Promise<void>
    {
        const actual: IPackage[] =
        [
            { dependencies: { b: "3.0.0" },         name: "a", version: "3.0.0"  },
            { dependencies: { c: "1.0.0-alpha.0" }, name: "b", version: "3.0.0"  },
            { name: "c", version: "1.0.0-alpha.0" },
        ];

        const expected: IPackage[] =
        [
            { dependencies: { b: "3.0.0" },         name: "a", version: "3.0.0"  },
            { dependencies: { c: "1.0.0-alpha.0" }, name: "b", version: "3.0.0"  },
            { name: "c", version: "1.0.0-alpha.0" },
        ];

        const options: Options = { silent: true, strategy: StrategyType.OnlyStable, version: "3.0.0-*.*" };

        const npmRepositoryMock = new Mock(new NpmRepository());
        npmRepositoryMock.setup("get").call(It.any(), It.any())
            .returns(Promise.reject({ code: "E404" }));

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async strategyTypeDefaultWithIgnoreDependentsAndOnlyStable(): Promise<void>
    {
        const actual: IPackage[] =
        [
            { dependencies: { b: "1.5.0" },         name: "a", version: "2.0.0"          },
            { dependencies: { c: "1.0.0-alpha.0" }, name: "b", version: "1.5.0"          },
            { dependencies: { e: "1.0.0" },         name: "c", version: "1.3.0-alpha.0"  },
            { name: "e", version: "1.0.0" },
        ];

        const expected: IPackage[] =
        [
            { dependencies: { b: "1.5.0" },         name: "a", version: "3.0.0"          },
            { dependencies: { c: "1.0.0-alpha.0" }, name: "b", version: "3.0.0"          },
            { dependencies: { e: "1.0.0" },         name: "c", version: "1.3.0-alpha.0"  },
            { name: "e", version: "3.0.0" },
        ];

        const options: Options = { silent: true, strategy: StrategyType.IgnoreDependents | StrategyType.OnlyStable, version: "3.0.0-*.*" };

        const npmRepositoryMock = new Mock(new NpmRepository());
        npmRepositoryMock.setup("get").call(It.any(), It.any())
            .returns(Promise.reject({ code: "E404" }));

        await new Depsync(npmRepositoryMock.proxy, toLookup(actual), options).sync();

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async repositoryError(): Promise<void>
    {
        const actual: IPackage[] =
        [
            { name: "a", version: "2.0.0" },
        ];

        const expected = { code: "E401" };

        const npmRepositoryMock = new Mock(new NpmRepository());
        npmRepositoryMock.setup("get").call(It.any(), It.any())
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