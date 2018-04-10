import Dictionary   from "@surface/collection/dictionary";
import { Nullable } from "@surface/types";
import Type         from ".";

export default abstract class MemberInfo
{
    protected _metadata: Nullable<Dictionary<string, Object>>;
    public get metadata(): Dictionary<string, Object>
    {
        return this._metadata = this._metadata ||
            Reflect.getMetadataKeys(this._declaringType.getPrototype(), this.key)
                .asEnumerable()
                .cast<string>()
                .toDictionary(x => x, x => Reflect.getMetadata(x, this._declaringType.getPrototype(), this.key));
    }

    protected _declaringType: Type;
    public get declaringType(): Type
    {
        return this._declaringType;
    }

    protected _key: string;
    public get key(): string
    {
        return this._key;
    }

    protected constructor(key: string, declaringType: Type)
    {
        this._key           = key;
        this._declaringType = declaringType;
    }
}