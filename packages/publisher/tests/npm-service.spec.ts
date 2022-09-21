import Mock, { It }                                                              from "@surface/mock";
import { afterEach, batchTest, beforeEach, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                                                      from "chai";
import chaiAsPromised                                                            from "chai-as-promised";
import libnpmpublish                                                             from "libnpmpublish";
import pacote                                                                    from "pacote";
import { untar }                                                                 from "../internal/common.js";
import NpmService                                                                from "../internal/npm-service.js";
import { type HasChangesScenario, scenarios }                                    from "./npm-service.has-changes.scn.js";

chai.use(chaiAsPromised);

const libnpmpublishMock = Mock.of(libnpmpublish);
const pacoteMock        = Mock.of(pacote);
const untarMock         = Mock.of(untar);

type Manifest        = Awaited<ReturnType<typeof pacote["manifest"]>>;
type PublishResponse = Awaited<ReturnType<typeof libnpmpublish["publish"]>>;
type TarballResponse = Awaited<ReturnType<typeof pacote["tarball"]>>;

@suite
export default class SuiteSpec
{
    @beforeEach
    public beforeEach(): void
    {
        libnpmpublishMock.lock();
        pacoteMock.lock();
        untarMock.lock();
    }

    @afterEach
    public afterEach(): void
    {
        libnpmpublishMock.release();
        pacoteMock.release();
        untarMock.release();
    }

    @test @shouldPass
    public async get(): Promise<void>
    {
        const error404     = new Error();
        const errorETarget = new Error();

        Object.defineProperty(error404, "code", { value: "E404" });
        Object.defineProperty(errorETarget, "code", { value: "ETARGET" });

        const manifestSetup = pacoteMock.setup("manifest");

        const FOO_404     = "foo@404";
        const FOO_ETARGET = "foo@etarget";
        const FOO_LATEST  = "foo@latest";

        manifestSetup.call(FOO_404, It.any()).reject(error404);
        manifestSetup.call(FOO_ETARGET, It.any()).reject(errorETarget);
        manifestSetup.call(FOO_LATEST, It.any()).resolve({ name: "foo" } as Manifest);

        const service = new NpmService();

        chai.assert.deepEqual(await service.get(FOO_404), null);
        chai.assert.deepEqual(await service.get(FOO_ETARGET), null);
        chai.assert.deepEqual(await service.get(FOO_LATEST), { name: "foo" } as Manifest);
    }

    @test @shouldPass
    public async isPublished(): Promise<void>
    {
        pacoteMock.setup("manifest").call("foo@1.0.0", It.any()).resolve({ name: "foo" } as Manifest);

        const service = new NpmService();

        chai.assert.deepEqual(await service.isPublished({ name: "foo", version: "1.0.0" }), true);
    }

    @shouldPass
    @batchTest(scenarios, x => x.message, x => x.skip)
    public async hasChanges(scenario: HasChangesScenario): Promise<void>
    {
        const LOCAL  = "local";
        const REMOTE = "remote";

        const localBuffer  = Buffer.from([0]) as TarballResponse;
        const remoteBuffer = Buffer.from([1]) as TarballResponse;

        const tarballSetup = pacoteMock.setup("tarball");

        tarballSetup.call(LOCAL, It.any()).resolve(localBuffer);

        scenario.remote
            ? tarballSetup.call(REMOTE, It.any()).resolve(remoteBuffer)
            : tarballSetup.call(REMOTE, It.any()).reject();

        untarMock.call(localBuffer).resolve(new Map(Object.entries(scenario.local)));
        untarMock.call(remoteBuffer).resolve(new Map(Object.entries(scenario.remote ?? { })));

        const service = new NpmService();

        chai.assert.deepEqual(await service.hasChanges(LOCAL, REMOTE, scenario.options), scenario.expected);
    }

    @test @shouldPass
    public async publish(): Promise<void>
    {
        libnpmpublishMock.setup("publish")
            .call(It.any(), It.any(), It.any())
            .resolve({ ok: true } as PublishResponse);

        const service = new NpmService();

        await chai.assert.isFulfilled(service.publish({ name: "foo", version: "1.0.0" }, Buffer.from([])));
    }

    @test @shouldPass
    public async unpublish(): Promise<void>
    {
        libnpmpublishMock.setup("unpublish")
            .call(It.any(), It.any())
            .resolve(true);

        const service = new NpmService();

        await chai.assert.isFulfilled(service.unpublish("foo@1.0.0"));
    }

    @test @shouldFail
    public async getShouldFail(): Promise<void>
    {
        pacoteMock.setup("manifest").call(It.any(), It.any()).reject(new Error());

        const service = new NpmService();

        await chai.assert.isRejected(service.get("foo"));
    }

    @test @shouldFail
    public async publishShouldFail(): Promise<void>
    {
        libnpmpublishMock.setup("publish")
            .call(It.any(), It.any(), It.any())
            .resolve({ ok: false } as PublishResponse);

        const service = new NpmService();

        await chai.assert.isRejected(service.publish({ name: "foo", version: "1.0.0" }, Buffer.from([])), /Failed to publish package foo/);
    }

    @test @shouldFail
    public async unpublishShouldFail(): Promise<void>
    {
        libnpmpublishMock.setup("unpublish")
            .call(It.any(), It.any())
            .resolve(false);

        const service = new NpmService();

        await chai.assert.isRejected(service.unpublish("foo@1.0.0"), /Failed to unpublish package foo/);
    }
}
