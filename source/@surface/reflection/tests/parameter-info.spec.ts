import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import MethodInfo                  from "../internal/method-info.js";
import ParameterInfo               from "../internal/parameter-info.js";
import Type                        from "../internal/type.js";
import Mock                        from "./fixtures/mock.js";

const methodInfo    = new MethodInfo("instanceMethodWithParametersMetadata", Object.getOwnPropertyDescriptor(Mock.prototype, "instanceMethodWithParametersMetadata")!, Type.of(Mock), false, false);
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
        expect(parameterInfo.metadata).to.deep.equal({ "design:type": Number });
    }

    @test @shouldPass
    public noMetadata(): void
    {
        const methodInfo    = new MethodInfo("instanceMethodWithParameters", Object.getOwnPropertyDescriptor(Mock.prototype, "instanceMethodWithParameters")!, Type.of(Mock), false, false);
        const parameterInfo = new ParameterInfo("a", 0, methodInfo, null);
        expect(parameterInfo.metadata).to.deep.equal({ });
    }

    @test @shouldPass
    public name(): void
    {
        expect(parameterInfo.name).to.deep.equal("a");
    }
}