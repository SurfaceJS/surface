/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseMock                                                                 from "./base-mock.js";
import { classMetadata, methodMetadata, parameterMetadata, propertyMedatadata } from "./decorators.js";

@classMetadata
class Mock extends BaseMock
{
    private static _staticProperty: number = 1;
    private _instanceProperty: number = 1;

    @propertyMedatadata
    public static get staticProperty(): number
    {
        return this._staticProperty;
    }

    public static set staticProperty(value: number)
    {
        this._staticProperty = value;
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public static get staticReadonlyProperty(): number
    {
        return 0;
    }

    @propertyMedatadata
    public get instanceProperty(): number
    {
        return this._instanceProperty;
    }

    public set instanceProperty(value: number)
    {
        this._instanceProperty = value;
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public get instanceReadonlyProperty(): number
    {
        return 0;
    }

    @methodMetadata
    public instanceMethodWithParametersMetadata(@parameterMetadata a: number, @parameterMetadata b: string, @parameterMetadata c: boolean): void
    {
        //
    }

    @methodMetadata
    public static staticMethod(@parameterMetadata a: number, @parameterMetadata b: string, @parameterMetadata c: boolean): void
    {
        //
    }

    public instanceMethod(): void
    {
        //
    }

    public instanceMethodWithParameters(a: number, b: string, c: boolean): void
    {
        //
    }
}

Object.defineProperty(Mock, "staticField", { value: 1 });
Object.defineProperty(Mock.prototype, "instanceField", { value: 1 });

export default Mock;
