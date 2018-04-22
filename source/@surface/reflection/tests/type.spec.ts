// tslint:disable:no-non-null-assertion
import Enumerable                  from "@surface/enumerable";
import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import FieldInfo                   from "../field-info";
import MethodInfo                  from "../method-info";
import PropertyInfo                from "../property-info";
import Type                        from "../type";
import BaseMock                    from "./fixtures/base-mock";
import Mock                        from "./fixtures/mock";

@suite
export default class TypeSpec
{
    @test @shouldPass
    public getTypeOf(): void
    {
        expect(Type.of(Mock)).to.deep.equal(Type.from(new Mock()));
    }

    @test @shouldPass
    public getTypeFrom(): void
    {
        expect(Type.from(new Mock())).to.deep.equal(Type.from(new Mock()));
    }

    @test @shouldPass
    public getNonBaseType(): void
    {
        expect(Type.of(Object).baseType).to.equal(null);
    }

    @test @shouldPass
    public getBaseType(): void
    {
        expect(Type.of(Mock).baseType).to.deep.equal(Type.of(BaseMock));
    }

    @test @shouldPass
    public getName(): void
    {
        expect(Type.of(Mock).name).to.equal("Mock");
    }

    @test @shouldPass
    public getConstructor(): void
    {
        expect(Type.of(Mock).getConstructor()).to.equal(Mock);
    }

    @test @shouldPass
    public getField(): void
    {
        const key = "instanceField";

        const actual   = Type.of(Mock).getField(key);
        const expected = new FieldInfo(key, Object.getOwnPropertyDescriptor(Mock.prototype, key)!, Type.of(Mock), false);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getFielMember(): void
    {
        const key = "instanceField";

        const actual   = Type.of(Mock).getMember(key);
        const expected = new FieldInfo(key, Object.getOwnPropertyDescriptor(Mock.prototype, key)!, Type.of(Mock), false);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getStaticField(): void
    {
        const key = "staticField";

        const actual   = Type.of(Mock).getStaticField(key);
        const expected = new FieldInfo(key, Object.getOwnPropertyDescriptor(Mock, key)!, Type.of(Mock), true);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getStaticFieldMember(): void
    {
        const key = "staticField";

        const actual   = Type.of(Mock).getStaticMember(key);
        const expected = new FieldInfo(key, Object.getOwnPropertyDescriptor(Mock, key)!, Type.of(Mock), true);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getMethod(): void
    {
        const key = "instanceMethod";

        const actual   = Type.of(Mock).getMethod(key);
        const expected = new MethodInfo(key, Mock.prototype[key], Type.of(Mock), false);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getMethodMember(): void
    {
        const key = "instanceMethod";

        const actual   = Type.of(Mock).getMember(key);
        const expected = new MethodInfo(key, Mock.prototype[key], Type.of(Mock), false);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getStaticMethod(): void
    {
        const key = "staticMethod";

        const actual   = Type.of(Mock).getStaticMethod(key);
        const expected = new MethodInfo(key, Mock[key], Type.of(Mock), true);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getStaticMethodMember(): void
    {
        const key = "staticMethod";

        const actual   = Type.of(Mock).getStaticMember(key);
        const expected = new MethodInfo(key, Mock[key], Type.of(Mock), true);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getProperty(): void
    {
        const key = "instanceProperty";

        const actual   = Type.of(Mock).getProperty(key);
        const expected = new PropertyInfo(key, Object.getOwnPropertyDescriptor(Mock.prototype, key)!, Type.of(Mock), false);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getPropertyMember(): void
    {
        const key = "instanceProperty";

        const actual   = Type.of(Mock).getMember(key);
        const expected = new PropertyInfo(key, Object.getOwnPropertyDescriptor(Mock.prototype, key)!, Type.of(Mock), false);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getReadonlyProperty(): void
    {
        const key = "instanceReadonlyProperty";

        const actual   = Type.of(Mock).getProperty(key);
        const expected = new PropertyInfo(key, Object.getOwnPropertyDescriptor(Mock.prototype, key)!, Type.of(Mock), false);

        expect(actual).to.deep.equal(expected);
        expect(actual!.readonly).to.equal(true);
    }

    @test @shouldPass
    public getStaticProperty(): void
    {
        const key = "staticProperty";

        const actual   = Type.of(Mock).getStaticProperty(key);
        const expected = new PropertyInfo(key, Object.getOwnPropertyDescriptor(Mock, key)!, Type.of(Mock), true);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getStaticPropertyMember(): void
    {
        const key = "staticProperty";

        const actual   = Type.of(Mock).getStaticMember(key);
        const expected = new PropertyInfo(key, Object.getOwnPropertyDescriptor(Mock, key)!, Type.of(Mock), true);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getStaticReadonlyProperty(): void
    {
        const key = "staticReadonlyProperty";

        const actual   = Type.of(Mock).getStaticProperty(key);
        const expected = new PropertyInfo(key, Object.getOwnPropertyDescriptor(Mock, key)!, Type.of(Mock), true);

        expect(actual).to.deep.equal(expected);
        expect(actual!.readonly).to.equal(true);
    }

    @test @shouldPass
    public getInvalidMember(): void
    {
        expect(Type.of(Mock).getMember("__invalid__")).to.deep.equal(null);
    }

    @test @shouldPass
    public getInvalidField(): void
    {
        expect(Type.of(Mock).getField("__invalid__")).to.deep.equal(null);
    }

    @test @shouldPass
    public getInvalidMethod(): void
    {
        expect(Type.of(Mock).getMethod("__invalid__")).to.deep.equal(null);
    }

    @test @shouldPass
    public getInvalidProperty(): void
    {
        expect(Type.of(Mock).getProperty("__invalid__")).to.deep.equal(null);
    }

    @test @shouldPass
    public getInvalidStaticMember(): void
    {
        expect(Type.of(Mock).getStaticMember("__invalid__")).to.deep.equal(null);
    }

    @test @shouldPass
    public getInvalidStaticField(): void
    {
        expect(Type.of(Mock).getStaticField("__invalid__")).to.deep.equal(null);
    }

    @test @shouldPass
    public getInvalidStaticMethod(): void
    {
        expect(Type.of(Mock).getStaticMethod("__invalid__")).to.deep.equal(null);
    }

    @test @shouldPass
    public getInvalidStaticProperty(): void
    {
        expect(Type.of(Mock).getStaticProperty("__invalid__")).to.deep.equal(null);
    }

    @test @shouldPass
    public getClassMetadata(): void
    {
        const type     = Type.of(Mock);
        const actual   = type.metadata /* caching */ && type.metadata;
        const expected = { };

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getBaseField(): void
    {
        const key = "baseInstanceField";

        const actual   = Type.of(Mock).getField(key);
        const expected = new FieldInfo(key, Object.getOwnPropertyDescriptor(BaseMock.prototype, key)!, Type.of(BaseMock), false);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getBaseStaticField(): void
    {
        const key = "baseStaticField";

        const actual   = Type.of(Mock).getStaticField(key);
        const expected = new FieldInfo(key, Object.getOwnPropertyDescriptor(BaseMock, key)!, Type.of(BaseMock), true);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getBaseMethod(): void
    {
        const key = "baseInstanceMethod";

        const actual   = Type.of(Mock).getMethod(key);
        const expected = new MethodInfo(key, BaseMock.prototype[key], Type.of(BaseMock), false);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getBaseStaticMethod(): void
    {
        const key = "baseStaticMethod";

        const actual   = Type.of(Mock).getStaticMethod(key);
        const expected = new MethodInfo(key, Mock[key], Type.of(BaseMock), true);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getBaseProperty(): void
    {
        const key = "baseInstanceProperty";

        const actual   = Type.of(Mock).getProperty(key);
        const expected = new PropertyInfo(key, Object.getOwnPropertyDescriptor(BaseMock.prototype, key)!, Type.of(BaseMock), false);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getBaseStaticProperty(): void
    {
        const key = "baseStaticProperty";

        const actual   = Type.of(Mock).getStaticProperty(key);
        const expected = new PropertyInfo(key, Object.getOwnPropertyDescriptor(BaseMock, key)!, Type.of(BaseMock), true);

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getBaseClassMetadata(): void
    {
        const actual   = Type.of(BaseMock).metadata;
        const expected = { };

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getFields(): void
    {
        const key     = "instanceField";
        const baseKey = "baseInstanceField";

        const actual = Enumerable.of(Type.of(Mock).getFields()).where(x => !x.declaringType.equals(Object)).toArray();

        const expected =
        [
            new FieldInfo(key, Object.getOwnPropertyDescriptor(Mock.prototype, key)!, Type.of(Mock), false),
            new FieldInfo(baseKey, Object.getOwnPropertyDescriptor(BaseMock.prototype, baseKey)!, Type.of(BaseMock), false)
        ];

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getStaticFields(): void
    {
        const length                    = "length";
        const prototype                 = "prototype";
        const name                      = "name";
        const privateStaticProperty     = "_staticProperty";
        const staticField               = "staticField";
        const privateBaseStaticProperty = "_baseStaticProperty";
        const baseStaticField           = "baseStaticField";

        const actual = Enumerable.of(Type.of(Mock).getStaticFields()).where(x => !x.declaringType.equals(Object)).toArray();

        const expected =
        [
            new FieldInfo(length,                    Object.getOwnPropertyDescriptor(Mock,     length)!,                    Type.of(Mock),     true),
            new FieldInfo(prototype,                 Object.getOwnPropertyDescriptor(Mock,     prototype)!,                 Type.of(Mock),     true),
            new FieldInfo(name,                      Object.getOwnPropertyDescriptor(Mock,     name)!,                      Type.of(Mock),     true),
            new FieldInfo(privateStaticProperty,     Object.getOwnPropertyDescriptor(Mock,     privateStaticProperty)!,     Type.of(Mock),     true),
            new FieldInfo(staticField,               Object.getOwnPropertyDescriptor(Mock,     staticField)!,               Type.of(Mock),     true),
            new FieldInfo(length,                    Object.getOwnPropertyDescriptor(BaseMock, length)!,                    Type.of(BaseMock), true),
            new FieldInfo(prototype,                 Object.getOwnPropertyDescriptor(BaseMock, prototype)!,                 Type.of(BaseMock), true),
            new FieldInfo(name,                      Object.getOwnPropertyDescriptor(BaseMock, name)!,                      Type.of(BaseMock), true),
            new FieldInfo(privateBaseStaticProperty, Object.getOwnPropertyDescriptor(BaseMock, privateBaseStaticProperty)!, Type.of(BaseMock), true),
            new FieldInfo(baseStaticField,           Object.getOwnPropertyDescriptor(BaseMock, baseStaticField)!,           Type.of(BaseMock), true),
        ];

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getProperties(): void
    {
        const instanceProperty         = "instanceProperty";
        const instanceReadonlyProperty = "instanceReadonlyProperty";
        const baseInstanceProperty     = "baseInstanceProperty";

        const actual = Enumerable.of(Type.of(Mock).getProperties()).where(x => !x.declaringType.equals(Object)).toArray();

        const expected =
        [
            new PropertyInfo(instanceProperty,         Object.getOwnPropertyDescriptor(Mock.prototype,     instanceProperty)!,         Type.of(Mock),     false),
            new PropertyInfo(instanceReadonlyProperty, Object.getOwnPropertyDescriptor(Mock.prototype,     instanceReadonlyProperty)!, Type.of(Mock),     false),
            new PropertyInfo(baseInstanceProperty,     Object.getOwnPropertyDescriptor(BaseMock.prototype, baseInstanceProperty)!,     Type.of(BaseMock), false),
        ];

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getStaticProperties(): void
    {
        const staticProperty         = "staticProperty";
        const staticReadonlyProperty = "staticReadonlyProperty";
        const baseStaticProperty     = "baseStaticProperty";

        const actual = Enumerable.of(Type.of(Mock).getStaticProperties()).where(x => !x.declaringType.equals(Object)).toArray();

        const expected =
        [
            new PropertyInfo(staticProperty,         Object.getOwnPropertyDescriptor(Mock,     staticProperty)!,         Type.of(Mock),     true),
            new PropertyInfo(staticReadonlyProperty, Object.getOwnPropertyDescriptor(Mock,     staticReadonlyProperty)!, Type.of(Mock),     true),
            new PropertyInfo(baseStaticProperty,     Object.getOwnPropertyDescriptor(BaseMock, baseStaticProperty)!,     Type.of(BaseMock), true),
        ];

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getMethods(): void
    {
        const actual = Enumerable.of(Type.of(Mock).getMethods()).where(x => !x.declaringType.equals(Object)).toArray();

        const expected =
        [
            new MethodInfo("constructor",                          Mock.prototype.constructor,                          Type.of(Mock),     false),
            new MethodInfo("instanceMethod",                       Mock.prototype.instanceMethod,                       Type.of(Mock),     false),
            new MethodInfo("instanceMethodWithParameters",         Mock.prototype.instanceMethodWithParameters,         Type.of(Mock),     false),
            new MethodInfo("instanceMethodWithParametersMetadata", Mock.prototype.instanceMethodWithParametersMetadata, Type.of(Mock),     false),
            new MethodInfo("constructor",                          BaseMock.prototype.constructor,                      Type.of(BaseMock), false),
            new MethodInfo("baseInstanceMethod",                   BaseMock.prototype.baseInstanceMethod,               Type.of(BaseMock), false),
        ];

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public getStaticMethods(): void
    {
        const actual = Enumerable.of(Type.of(Mock).getStaticMethods()).where(x => !x.declaringType.equals(Object)).toArray();

        const expected =
        [
            new MethodInfo("staticMethod",     Mock.staticMethod,         Type.of(Mock),     false),
            new MethodInfo("baseStaticMethod", BaseMock.baseStaticMethod, Type.of(BaseMock), false),
        ];

        expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public checkExtensible(): void
    {
        expect(Type.of(Mock).extensible).to.equal(true);
    }

    @test @shouldPass
    public checkFrozen(): void
    {
        expect(Type.of(Mock).frozen).to.equal(false);
    }

    @test @shouldPass
    public checkSealed(): void
    {
        expect(Type.of(Mock).sealed).to.equal(false);
    }

    @test @shouldPass
    public checkExtendsClass(): void
    {
        expect(Type.of(Mock).extends(BaseMock)).to.equal(true);
    }

    @test @shouldPass
    public checkExtendsType(): void
    {
        expect(Type.of(Mock).extends(Type.of(BaseMock))).to.equal(true);
    }

    @test @shouldPass
    public checkExtendsWithoutBaseType(): void
    {
        expect(Type.of(Object).extends(Mock)).to.equal(false);
    }

    @test @shouldPass
    public checkEqualsClass(): void
    {
        expect(Type.of(Mock).equals(Mock)).to.equal(true);
    }

    @test @shouldPass
    public checkEqualsType(): void
    {
        expect(Type.of(Mock).equals(Type.of(Mock))).to.equal(true);
    }
}