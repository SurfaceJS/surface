import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
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
        assert.deepEqual(fieldInfo.declaringType, Type.of(Mock));
    }

    @test @shouldPass
    public isStatic(): void
    {
        assert.equal(fieldInfo.isStatic, false);
    }

    @test @shouldPass
    public isOwn(): void
    {
        assert.equal(fieldInfo.isOwn, false);
    }

    @test @shouldPass
    public key(): void
    {
        assert.equal(fieldInfo.key, "instanceField");
    }

    @test @shouldPass
    public readonly(): void
    {
        assert.equal(fieldInfo.readonly, true);
    }
}
