import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import PropertyInfo                from "../internal/property-info";
import Type                        from "../internal/type";
import Mock                        from "./fixtures/mock";

const propertyInfo = new PropertyInfo("instanceProperty", Object.getOwnPropertyDescriptor(Mock.prototype, "instanceProperty")!, Type.of(Mock), false, false);

@suite
export default class FieldInfoSpec
{
    @test @shouldPass
    public declaringType(): void
    {
        expect(propertyInfo.declaringType).to.deep.equal(Type.of(Mock));
    }

    @test @shouldPass
    public isStatic(): void
    {
        expect(propertyInfo.isStatic).to.equal(false);
    }

    @test @shouldPass
    public key(): void
    {
        expect(propertyInfo.key).to.equal("instanceProperty");
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
        expect(propertyInfo.metadata).to.deep.equal(metadata);
        expect(propertyInfo.metadata).to.deep.equal(metadata);
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

        expect(propertyInfo.metadata).to.deep.equal(metadata);
    }

    @test @shouldPass
    public readonly(): void
    {
        expect(propertyInfo.readonly).to.equal(false);
    }
}