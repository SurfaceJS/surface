import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import PropertyInfo                from "../internal/property-info.js";
import Type                        from "../internal/type.js";
import Mock                        from "./fixtures/mock.js";

const propertyInfo = new PropertyInfo("instanceProperty", Object.getOwnPropertyDescriptor(Mock.prototype, "instanceProperty")!, Type.of(Mock), false, false);

@suite
export default class FieldInfoSpec
{
    @test @shouldPass
    public declaringType(): void
    {
        assert.deepEqual(propertyInfo.declaringType, Type.of(Mock));
    }

    @test @shouldPass
    public isStatic(): void
    {
        assert.equal(propertyInfo.isStatic, false);
    }

    @test @shouldPass
    public isOwn(): void
    {
        assert.equal(propertyInfo.isOwn, false);
    }

    @test @shouldPass
    public key(): void
    {
        assert.equal(propertyInfo.key, "instanceProperty");
    }

    @test @shouldPass
    public readonly(): void
    {
        assert.equal(propertyInfo.readonly, false);
    }
}
