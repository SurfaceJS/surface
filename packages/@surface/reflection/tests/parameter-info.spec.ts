import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import MethodInfo                  from "../internal/method-info.js";
import ParameterInfo               from "../internal/parameter-info.js";
import Type                        from "../internal/type.js";
import Mock                        from "./fixtures/mock.js";

const methodInfo    = new MethodInfo("instanceMethodWithParametersMetadata", Object.getOwnPropertyDescriptor(Mock.prototype, "instanceMethodWithParametersMetadata")!, Type.of(Mock), false, false);
const parameterInfo = new ParameterInfo("a", 0, methodInfo);

@suite
export default class ParameterInfoSpec
{
    @test @shouldPass
    public declaringMethod(): void
    {
        chai.assert.deepEqual(parameterInfo.declaringMethod, methodInfo);
    }

    @test @shouldPass
    public index(): void
    {
        chai.assert.equal(parameterInfo.index, 0);
    }

    @test @shouldPass
    public name(): void
    {
        chai.assert.deepEqual(parameterInfo.name, "a");
    }
}