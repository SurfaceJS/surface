import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import FieldInfo                   from "../internal/field-info.js";
import Type                        from "../internal/type.js";
import Mock                        from "./fixtures/mock.js";

const fieldInfo = new FieldInfo("instanceField", Object.getOwnPropertyDescriptor(Mock.prototype, "instanceField")!, Type.of(Mock), false, false);

@suite
export default class FieldInfoSpec
{
    @test @shouldPass
    public declaringType(): void
    {
        chai.assert.deepEqual(fieldInfo.declaringType, Type.of(Mock));
    }

    @test @shouldPass
    public isStatic(): void
    {
        chai.assert.equal(fieldInfo.isStatic, false);
    }

    @test @shouldPass
    public key(): void
    {
        chai.assert.equal(fieldInfo.key, "instanceField");
    }

    @test @shouldPass
    public metadata(): void
    {
        chai.assert.deepEqual(fieldInfo.metadata, { });
    }

    @test @shouldPass
    public readonly(): void
    {
        chai.assert.equal(fieldInfo.readonly, true);
    }
}