import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import getExports                  from "../internal/get-exports.js";

@suite
export default class GetExportsSpec
{
    @test @shouldPass
    public getEsmExports(): void
    {
        const expected =
        [
            "export let value = proxy.value",
            "export let x = proxy.x",
            "export let y = proxy.y",
            "export let z = proxy.z",
            "export let fn = proxy.fn",
            "export let Class = proxy.Class",
            "export let foo = proxy.foo",
            "export let bar = proxy.bar",
            "export let baz = proxy.baz",
            "export let otherDefault = proxy.otherDefault",
            "export * from \"baz\"",
            "export default proxy.default",
        ];

        const source =
        [
            "import { foo, bar, baz } from 'my-module'",
            "export const value = 1;",
            "export let x = 1, y = 1, z = 3;",
            "export function fn () { }",
            "export class Class { }",
            "export { foo, bar, baz as baz }",
            "export { default as otherDefault } from 'other-default'",
            "export * from 'baz'",
            "export default 1;",
        ].join("\n");

        const result = getExports(source);

        chai.assert.isTrue(result.esm);
        chai.assert.deepEqual(result.exports, expected);
    }

    @test @shouldPass
    public getCjsExports(): void
    {
        const expected =
        [
            "export let foo = proxy.foo",
            "export default proxy.default",
            "export default proxy",
        ];

        const source =
        [
            "module.exports.foo = 1",
            "module.exports.default = 2",
            "module.exports = { value: 1 }",
        ].join("\n");

        const result = getExports(source);

        chai.assert.isFalse(result.esm);
        chai.assert.deepEqual(result.exports, expected);
    }
}