import path                        from "path";
import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import OverrideResolverPlugin      from "../../internal/plugins/override-resolver-plugin.js";

type Resolver = Parameters<OverrideResolverPlugin["apply"]>[0];

const CWD = process.cwd();

const FILE1          = path.join(CWD, "file-1.js");
const FILE1_OVERRIDE = path.join(CWD, "file-1-override.js");
const FILE2          = path.join(CWD, "file-2.js");

@suite
export default class OverrideResolverPluginSpec
{
    @test @shouldPass
    public apply(): void
    {
        const paths: (false | string)[] = [false, FILE1, FILE2];

        const actual: (false | string)[] = [];
        const expected = [false, FILE1_OVERRIDE, FILE2];

        const resolver =
        {
            hooks:
            {
                result:
                {
                    tap(_, callback): void
                    {
                        const payloads = paths.map(path => ({ request: { path }, resolved: "" }));

                        for (const payload of payloads)
                        {
                            callback(payload.request, { });

                            actual.push(payload.request.path);
                        }
                    },
                },
            },
        } as Resolver;

        new OverrideResolverPlugin([{ replace: FILE1, with: FILE1_OVERRIDE }]).apply(resolver);

        chai.assert.deepEqual(actual, expected);
    }
}