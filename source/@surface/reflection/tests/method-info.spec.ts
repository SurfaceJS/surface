import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
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
        chai.assert.deepEqual(methodInfo.declaringType, Type.of(Mock));
    }

    @test @shouldPass
    public invoke(): void
    {
        chai.assert.equal(methodInfo.invoke.toString(), Mock.prototype.instanceMethod.toString());
    }

    @test @shouldPass
    public isStatic(): void
    {
        chai.assert.equal(methodInfo.isStatic, false);
    }

    @test @shouldPass
    public isConstructor(): void
    {
        chai.assert.equal(methodInfo.isConstructor, false);
    }

    @test @shouldPass
    public key(): void
    {
        chai.assert.equal(methodInfo.key, "instanceMethod");
    }

    @test @shouldPass
    public metadata(): void
    {
        const methodInfo = new MethodInfo
        (
            "instanceMethodWithParametersMetadata",
            Object.getOwnPropertyDescriptor(Mock.prototype, "instanceMethodWithParametersMetadata")!,
            Type.of(Mock),
            false,
            false,
        );

        const metadata =
        {
            "design:paramtypes": [Number, String, Boolean],
            "design:returntype": undefined,
            "design:type":       Function,
        };

        chai.assert.deepEqual(methodInfo.metadata, metadata);
    }

    @test @shouldPass
    public noParameters(): void
    {
        chai.assert.deepEqual(Array.from(methodInfo.parameters), []);
    }

    @test @shouldPass
    public withParameters(): void
    {
        const methodInfo = new MethodInfo("instanceMethodWithParameters", Object.getOwnPropertyDescriptor(Mock.prototype, "instanceMethodWithParameters")!, Type.of(Mock), false, false);

        const parameters =
        [
            new ParameterInfo("a", 0, methodInfo, null),
            new ParameterInfo("b", 1, methodInfo, null),
            new ParameterInfo("c", 2, methodInfo, null),
        ];

        chai.assert.equal(methodInfo.parameters.length, 3);
        chai.assert.deepEqual(methodInfo.parameters, parameters);
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
            new ParameterInfo("a", 0, methodInfo, Number),
            new ParameterInfo("b", 1, methodInfo, String),
            new ParameterInfo("c", 2, methodInfo, Boolean),
        ];

        chai.assert.equal(methodInfo.parameters.length, 3);
        chai.assert.deepEqual(methodInfo.parameters, parameters);
    }
}