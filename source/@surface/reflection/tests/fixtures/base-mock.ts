import { classMetadata, methodMetadata, parameterMetadata, propertyMedatadata } from "./decorators.js";

@classMetadata
class BaseMock
{
    private static _baseStaticProperty: number = 1;
    private _baseInstanceProperty: number = 1;

    @propertyMedatadata
    public static get baseStaticProperty(): number
    {
        return this._baseStaticProperty;
    }

    public static set baseStaticProperty(value: number)
    {
        this._baseStaticProperty = value;
    }

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
    public static baseStaticMethod(@parameterMetadata _a: number, @parameterMetadata _b: string, @parameterMetadata _c: boolean): void
    {
        //
    }

    @methodMetadata
    public baseInstanceMethod(@parameterMetadata _a: number, @parameterMetadata _b: string, @parameterMetadata _c: boolean): void
    {
        //
    }
}

Object.defineProperty(BaseMock, "baseStaticField", { value: 1 });
Object.defineProperty(BaseMock.prototype, "baseInstanceField", { value: 1 });

export default BaseMock;