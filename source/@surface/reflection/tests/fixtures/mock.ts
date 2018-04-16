import BaseMock                                                                 from "./base-mock";
import { classMetadata, methodMetadata, parameterMetadata, propertyMedatadata } from "./decorators";

@classMetadata
export default class Mock extends BaseMock
{
    private static _staticProperty: number = 1;
    @propertyMedatadata
    public static get staticProperty(): number
    {
        return this._staticProperty;
    }

    public static set staticProperty(value: number)
    {
        this._staticProperty = value;
    }

    public static get staticReadonlyProperty(): number
    {
        return 0;
    }

    private _instanceProperty: number = 1;
    @propertyMedatadata
    public get instanceProperty(): number
    {
        return this._instanceProperty;
    }

    public set instanceProperty(value: number)
    {
        this._instanceProperty = value;
    }

    public get instanceReadonlyProperty(): number
    {
        return 0;
    }

    @methodMetadata
    public static staticMethod(@parameterMetadata a: number, @parameterMetadata b: string, @parameterMetadata c: boolean): void
    {
        return;
    }

    public instanceMethod(): void
    {
        return;
    }

    public instanceMethodWithParameters(a: number, b: string, c: boolean): void
    {
        return;
    }

    @methodMetadata
    public instanceMethodWithParametersMetadata(@parameterMetadata a: number, @parameterMetadata b: string, @parameterMetadata c: boolean): void
    {
        return;
    }
}

Object.defineProperty(Mock, "staticField", { value: 1 });
Object.defineProperty(Mock.prototype, "instanceField", { value: 1 });