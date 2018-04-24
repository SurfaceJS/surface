import { Nullable } from "@surface/core";
import MethodInfo   from "./method-info";

export default class ParameterInfo
{
    private readonly _declaringMethod: MethodInfo;
    public get declaringMethod(): MethodInfo
    {
        return this._declaringMethod;
    }

    private readonly _index: number;
    public get index(): number
    {
        return this._index;
    }

    private readonly _metadata: Object;
    public get metadata(): Object
    {
        return this._metadata;
    }

    private readonly _name: string;
    public get name(): string
    {
        return this._name;
    }

    public constructor(name: string, index: number, declaringMethod: MethodInfo, paramType: Nullable<Object>)
    {
        this._declaringMethod = declaringMethod;
        this._name            = name;
        this._index           = index;
        this._metadata        = paramType ? { "design:type": paramType } : { };
    }
}