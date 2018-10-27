import { Indexer, Nullable } from "@surface/core";
import Type                  from "./type";

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

    private readonly _key: string|symbol;
    public get key(): string|symbol
    {
        return this._key;
    }

    protected _metadata: Nullable<Indexer>;
    public get metadata(): Indexer
    {
        if (!this._metadata)
        {
            const metadata: Indexer = { };
            Reflect.getMetadataKeys(this.isStatic ? this.declaringType.getConstructor() : this.declaringType.getPrototype(), this.key)
                .forEach(key => metadata[key] = Reflect.getMetadata(key, this.isStatic ? this.declaringType.getConstructor() : this.declaringType.getPrototype(), this.key));

            this._metadata = metadata;
        }

        return this._metadata;
    }

    protected constructor(key: string|symbol, declaringType: Type, isStatic: boolean)
    {
        this._key           = key;
        this._declaringType = declaringType;
        this._isStatic      = isStatic;
    }
}