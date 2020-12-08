import { suite, test } from "../../source/@surface/test-suite/index.js";
import NpmRepository   from "../internal/npm-repository.js";
import Publisher       from "../internal/publisher.js";

@suite
export default class PublisherSpec
{
    @test
    public async publish(): Promise<void>
    {
        const auth = { alwaysAuth: true, email: "foo@bar", password: "bar", username: "foo" };

        await new Publisher(new Map(), new NpmRepository(), auth, "public", true).publish();
    }
}
