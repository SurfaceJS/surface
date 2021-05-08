import type MethodInfo from "./method-info.js";

export default class ParameterInfo
{
    private readonly _declaringMethod: MethodInfo;
    private readonly _index: number;
    private readonly _name: string;

    public get declaringMethod(): MethodInfo
    {
        return this._declaringMethod;
    }

    public get index(): number
    {
        return this._index;
    }

    public get name(): string
    {
        return this._name;
    }

    public constructor(name: string, index: number, declaringMethod: MethodInfo)
    {
        this._declaringMethod = declaringMethod;
        this._name            = name;
        this._index           = index;
    }
}