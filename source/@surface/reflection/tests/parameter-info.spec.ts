import KeyValuePair                from "@surface/collection/key-value-pair";
import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import MethodInfo                  from "../method-info";
import ParameterInfo               from "../parameter-info";
import Type                        from "../type";
import Mock                        from "./fixtures/mock";

const methodInfo    = new MethodInfo("instanceMethodWithParametersMetadata", Mock.prototype.instanceMethodWithParametersMetadata, Type.of(Mock), false);
const parameterInfo = new ParameterInfo("a", 0, methodInfo, Number);

@suite
export default class ParameterInfoSpec
{
    @test @shouldPass
    public declaringMethod(): void
    {
        expect(parameterInfo.declaringMethod).to.deep.equal(methodInfo);
    }

    @test @shouldPass
    public index(): void
    {
        expect(parameterInfo.index).to.equal(0);
    }

    @test @shouldPass
    public metadata(): void
    {
        expect(parameterInfo.metadata.toArray()).to.deep.equal([new KeyValuePair("design:type", Number)]);
    }

    @test @shouldPass
    public noMmetadata(): void
    {
        const methodInfo    = new MethodInfo("instanceMethodWithParameters", Mock.prototype.instanceMethodWithParameters, Type.of(Mock), false);
        const parameterInfo = new ParameterInfo("a", 0, methodInfo, undefined);
        expect(parameterInfo.metadata.toArray()).to.deep.equal([]);
    }

    @test @shouldPass
    public name(): void
    {
        expect(parameterInfo.name).to.deep.equal("a");
    }
}