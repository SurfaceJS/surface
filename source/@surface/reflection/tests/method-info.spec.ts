// tslint:disable:no-non-null-assertion

import KeyValuePair                from "@surface/collection/key-value-pair";
import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import MethodInfo                  from "../method-info";
import ParameterInfo               from "../parameter-info";
import Type                        from "../type";
import Mock                        from "./fixtures/mock";

const methodInfo = new MethodInfo("instanceMethod", Mock.prototype.instanceMethod, Type.of(Mock), false);

@suite
export default class FieldInfoSpec
{
    @test @shouldPass
    public declaringType(): void
    {
        expect(methodInfo.declaringType).to.deep.equal(Type.of(Mock));
    }

    @test @shouldPass
    public invoke(): void
    {
        expect(methodInfo.invoke.toString()).to.equal(Mock.prototype.instanceMethod.toString());
    }

    @test @shouldPass
    public isStatic(): void
    {
        expect(methodInfo.isStatic).to.equal(false);
    }

    @test @shouldPass
    public isConstructor(): void
    {
        expect(methodInfo.isConstructor).to.equal(false);
    }

    @test @shouldPass
    public key(): void
    {
        expect(methodInfo.key).to.equal("instanceMethod");
    }

    @test @shouldPass
    public metadata(): void
    {
        const methodInfo = new MethodInfo("instanceMethodWithParametersMetadata", Mock.prototype.instanceMethodWithParametersMetadata, Type.of(Mock), false);

        const metadata =
        [
            new KeyValuePair("design:returntype", undefined),
            new KeyValuePair("design:paramtypes", [Number, String, Boolean]),
            new KeyValuePair("design:type", Function),
        ];

        expect(methodInfo.metadata.toArray()).to.deep.equal(metadata);
    }

    @test @shouldPass
    public noParameters(): void
    {
        expect(methodInfo.parameters.toArray()).to.deep.equal([]);
    }

    @test @shouldPass
    public withParameters(): void
    {
        const methodInfo = new MethodInfo("instanceMethodWithParameters", Mock.prototype.instanceMethodWithParameters, Type.of(Mock), false);

        const parameters =
        [
            new ParameterInfo("a", 0, methodInfo, null),
            new ParameterInfo("b", 1, methodInfo, null),
            new ParameterInfo("c", 2, methodInfo, null),
        ];

        methodInfo.parameters.toArray(); // Caching;

        expect(methodInfo.parameters.toArray()).to.deep.equal(parameters);
    }

    @test @shouldPass
    public withParametersMetadata(): void
    {
        const methodInfo = new MethodInfo("instanceMethodWithParametersMetadata", Mock.prototype.instanceMethodWithParametersMetadata, Type.of(Mock), false);

        const parameters =
        [
            new ParameterInfo("a", 0, methodInfo, Number),
            new ParameterInfo("b", 1, methodInfo, String),
            new ParameterInfo("c", 2, methodInfo, Boolean),
        ];

        methodInfo.parameters.toArray(); // Caching;

        expect(methodInfo.parameters.toArray()).to.deep.equal(parameters);
    }
}