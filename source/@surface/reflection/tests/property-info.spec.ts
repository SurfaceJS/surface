// tslint:disable:no-non-null-assertion
import KeyValuePair                from "@surface/collection/key-value-pair";
import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import PropertyInfo                from "../property-info";
import Type                        from "../type";
import Mock                        from "./fixtures/mock";

const propertyInfo = new PropertyInfo("instanceProperty", Object.getOwnPropertyDescriptor(Mock.prototype ,"instanceProperty")!, Type.of(Mock), false);

@suite
export default class FieldInfoSpec
{
    @test @shouldPass
    public configurable(): void
    {
        expect(propertyInfo.configurable).to.equal(true);
    }

    @test @shouldPass
    public declaringType(): void
    {
        expect(propertyInfo.declaringType).to.deep.equal(Type.of(Mock));
    }

    @test @shouldPass
    public enumerable(): void
    {
        expect(propertyInfo.enumerable).to.equal(false);
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
        [
            new KeyValuePair("design:paramtypes", [Number]),
            new KeyValuePair("design:type", Number),
        ];

        expect(propertyInfo.metadata.toArray()).to.deep.equal(metadata);
    }

    @test @shouldPass
    public staticPropertymetadata(): void
    {
        const propertyInfo = new PropertyInfo("staticProperty", Object.getOwnPropertyDescriptor(Mock ,"staticProperty")!, Type.of(Mock), true);

        const metadata =
        [
            new KeyValuePair("design:paramtypes", [Number]),
            new KeyValuePair("design:type", Number),
        ];

        expect(propertyInfo.metadata.toArray()).to.deep.equal(metadata);
    }

    @test @shouldPass
    public readonly(): void
    {
        expect(propertyInfo.readonly).to.equal(false);
    }

    @test @shouldPass
    public value(): void
    {
        expect(propertyInfo.value).to.equal(undefined);
    }

    @test @shouldPass
    public getter(): void
    {
        expect(propertyInfo.getter).to.instanceof(Function);
    }

    @test @shouldPass
    public setter(): void
    {
        expect(propertyInfo.setter).to.instanceof(Function);
    }
}