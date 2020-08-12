import { suite, test } from "../../source/@surface/test-suite";
import NpmRepository   from "../internal/npm-repository";
import Publisher       from "../internal/publisher";

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
