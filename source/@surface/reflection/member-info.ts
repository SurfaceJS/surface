import { Indexer, Nullable } from "@surface/core";
import Type                  from "./type";

export default abstract class MemberInfo
{
    private readonly _declaringType: Type;
    public get declaringType(): Type
    {
        return this._declaringType;
    }

    private readonly _descriptor: PropertyDescriptor;
    public get descriptor(): PropertyDescriptor
    {
        return this._descriptor;
    }

    private readonly _isOwn: boolean;
    public get isOwn(): boolean
    {
        return this._isOwn;
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

    protected constructor(key: string|symbol, descriptor: PropertyDescriptor, declaringType: Type, isOwn: boolean, isStatic: boolean)
    {
        this._key           = key;
        this._descriptor    = descriptor;
        this._declaringType = declaringType;
        this._isOwn         = isOwn;
        this._isStatic      = isStatic;
    }
}