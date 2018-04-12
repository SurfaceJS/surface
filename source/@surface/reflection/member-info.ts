import Dictionary   from "@surface/collection/dictionary";
import { Nullable } from "@surface/types";
import Type         from "./type";

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

    protected _metadata: Nullable<Dictionary<string, Object>>;
    public get metadata(): Dictionary<string, Object>
    {
        return this._metadata = this._metadata ||
            Reflect.getMetadataKeys(this.isStatic ? this.declaringType.getConstructor() : this.declaringType.getPrototype(), this.key)
                .asEnumerable()
                .cast<string>()
                .toDictionary(x => x, x => Reflect.getMetadata(x, this.isStatic ? this.declaringType.getConstructor() : this.declaringType.getPrototype(), this.key));
    }

    protected constructor(key: string, declaringType: Type, isStatic: boolean)
    {
        this._key           = key;
        this._declaringType = declaringType;
        this._isStatic      = isStatic;
    }
}