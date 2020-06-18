import { suite, test } from "../../source/@surface/test-suite";
import NpmRepository   from "../internal/npm-repository";
import Publisher       from "../internal/publisher";

@suite
export default class PublisherSpec
{
    @test
    public async publish(): Promise<void>
    {
        const auth = { username: "foo", password: "bar", email: "foo@bar", alwaysAuth: true };

        await new Publisher(new Map(), new NpmRepository(), auth, "public", true).publish();
    }
}