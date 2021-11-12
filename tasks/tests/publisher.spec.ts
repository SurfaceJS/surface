import { suite, test } from "../../packages/@surface/test-suite/index.js";
import NpmRepository   from "../internal/npm-repository.js";
import Publisher       from "../internal/publisher.js";

@suite
export default class PublisherSpec
{
    @test
    public async publish(): Promise<void>
    {
        await new Publisher(new NpmRepository(), new Map(), true).publish();
    }
}
