import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import FieldInfo                   from "../internal/field-info";
import Type                        from "../internal/type";
import Mock                        from "./fixtures/mock";

const fieldInfo = new FieldInfo("instanceField", Object.getOwnPropertyDescriptor(Mock.prototype ,"instanceField")!, Type.of(Mock), false, false);

@suite
export default class FieldInfoSpec
{
    @test @shouldPass
    public declaringType(): void
    {
        expect(fieldInfo.declaringType).to.deep.equal(Type.of(Mock));
    }

    @test @shouldPass
    public isStatic(): void
    {
        expect(fieldInfo.isStatic).to.equal(false);
    }

    @test @shouldPass
    public key(): void
    {
        expect(fieldInfo.key).to.equal("instanceField");
    }

    @test @shouldPass
    public metadata(): void
    {
        expect(fieldInfo.metadata).to.deep.equal({ });
    }

    @test @shouldPass
    public readonly(): void
    {
        expect(fieldInfo.readonly).to.equal(true);
    }
}