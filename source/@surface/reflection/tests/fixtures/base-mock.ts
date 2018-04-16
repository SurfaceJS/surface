import { classMetadata, methodMetadata, parameterMetadata, propertyMedatadata } from "./decorators";

@classMetadata
export default class BaseMock
{
    private static _baseStaticProperty: number = 1;
    @propertyMedatadata
    public static get baseStaticProperty(): number
    {
        return this._baseStaticProperty;
    }

    public static set baseStaticProperty(value: number)
    {
        this._baseStaticProperty = value;
    }

    private _baseInstanceProperty: number = 1;
    @propertyMedatadata
    public get baseInstanceProperty(): number
    {
        return this._baseInstanceProperty;
    }

    public set baseInstanceProperty(value: number)
    {
        this._baseInstanceProperty = value;
    }

    @methodMetadata
    public static baseStaticMethod(@parameterMetadata a: number, @parameterMetadata b: string, @parameterMetadata c: boolean): void
    {
        return;
    }

    @methodMetadata
    public baseInstanceMethod(@parameterMetadata a: number, @parameterMetadata b: string, @parameterMetadata c: boolean): void
    {
        return;
    }
}

Object.defineProperty(BaseMock, "baseStaticField", { value: 1 });
Object.defineProperty(BaseMock.prototype, "baseInstanceField", { value: 1 });