import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import MethodInfo                  from "../internal/method-info.js";
import ParameterInfo               from "../internal/parameter-info.js";
import Type                        from "../internal/type.js";
import Mock                        from "./fixtures/mock.js";

const methodInfo = new MethodInfo("instanceMethod", Object.getOwnPropertyDescriptor(Mock.prototype, "instanceMethod")!, Type.of(Mock), false, false);

@suite
export default class FieldInfoSpec
{
    @test @shouldPass
    public declaringType(): void
    {
        assert.deepEqual(methodInfo.declaringType, Type.of(Mock));
    }

    @test @shouldPass
    public invoke(): void
    {
        assert.equal(methodInfo.invoke.toString(), Mock.prototype.instanceMethod.toString());
    }

    @test @shouldPass
    public isStatic(): void
    {
        assert.equal(methodInfo.isStatic, false);
    }

    @test @shouldPass
    public isOwn(): void
    {
        assert.equal(methodInfo.isOwn, false);
    }

    @test @shouldPass
    public isConstructor(): void
    {
        assert.equal(methodInfo.isConstructor, false);
    }

    @test @shouldPass
    public key(): void
    {
        assert.equal(methodInfo.key, "instanceMethod");
    }

    @test @shouldPass
    public noParameters(): void
    {
        assert.deepEqual(Array.from(methodInfo.parameters), []);
    }

    @test @shouldPass
    public withParameters(): void
    {
        const methodInfo = new MethodInfo("instanceMethodWithParameters", Object.getOwnPropertyDescriptor(Mock.prototype, "instanceMethodWithParameters")!, Type.of(Mock), false, false);

        const parameters =
        [
            new ParameterInfo("a", 0, methodInfo),
            new ParameterInfo("b", 1, methodInfo),
            new ParameterInfo("c", 2, methodInfo),
        ];

        assert.equal(methodInfo.parameters.length, 3);
        assert.deepEqual(methodInfo.parameters, parameters);
    }

    @test @shouldPass
    public withParametersMetadata(): void
    {
        const methodInfo = new MethodInfo
        (
            "instanceMethodWithParametersMetadata",
            Object.getOwnPropertyDescriptor(Mock.prototype, "instanceMethodWithParametersMetadata")!,
            Type.of(Mock),
            false,
            false,
        );

        const parameters =
        [
            new ParameterInfo("a", 0, methodInfo),
            new ParameterInfo("b", 1, methodInfo),
            new ParameterInfo("c", 2, methodInfo),
        ];

        assert.equal(methodInfo.parameters.length, 3);
        assert.deepEqual(methodInfo.parameters, parameters);
    }
}
