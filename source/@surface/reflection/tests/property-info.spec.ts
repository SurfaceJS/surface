import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
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
        chai.assert.deepEqual(propertyInfo.declaringType, Type.of(Mock));
    }

    @test @shouldPass
    public isStatic(): void
    {
        chai.assert.equal(propertyInfo.isStatic, false);
    }

    @test @shouldPass
    public key(): void
    {
        chai.assert.equal(propertyInfo.key, "instanceProperty");
    }

    @test @shouldPass
    public metadata(): void
    {
        const metadata =
        {
            "design:paramtypes": [Number],
            "design:type":       Number,
        };

        // Caching
        chai.assert.deepEqual(propertyInfo.metadata, metadata);
        chai.assert.deepEqual(propertyInfo.metadata, metadata);
    }

    @test @shouldPass
    public staticPropertymetadata(): void
    {
        const propertyInfo = new PropertyInfo("staticProperty", Object.getOwnPropertyDescriptor(Mock, "staticProperty")!, Type.of(Mock), false, true);

        const metadata =
        {
            "design:paramtypes": [Number],
            "design:type":       Number,
        };

        chai.assert.deepEqual(propertyInfo.metadata, metadata);
    }

    @test @shouldPass
    public readonly(): void
    {
        chai.assert.equal(propertyInfo.readonly, false);
    }
}