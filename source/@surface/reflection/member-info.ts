import { Nullable, ObjectLiteral } from "@surface/core";
import Type                        from "./type";

export default abstract class MemberInfo
{
    private readonly _declaringType: Type;
    public get declaringType(): Type
    {
        return this._declaringType;
    }

    private readonly _isStatic: boolean;
    public get isStatic(): boolean
    {
        return this._isStatic;
    }

    private readonly _key: string;
    public get key(): string
    {
        return this._key;
    }

    protected _metadata: Nullable<ObjectLiteral>;
    public get metadata(): ObjectLiteral
    {
        if (!this._metadata)
        {
            const metadata: ObjectLiteral = { };
            Reflect.getMetadataKeys(this.isStatic ? this.declaringType.getConstructor() : this.declaringType.getPrototype(), this.key)
                .forEach(key => metadata[key] = Reflect.getMetadata(key, this.isStatic ? this.declaringType.getConstructor() : this.declaringType.getPrototype(), this.key));

            this._metadata = metadata;
        }

        return this._metadata;
    }

    protected constructor(key: string, declaringType: Type, isStatic: boolean)
    {
        this._key           = key;
        this._declaringType = declaringType;
        this._isStatic      = isStatic;
    }
}