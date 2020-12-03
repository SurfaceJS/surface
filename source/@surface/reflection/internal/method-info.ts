import MemberInfo    from "./member-info";
import ParameterInfo from "./parameter-info";
import Type          from "./type";

export default class MethodInfo extends MemberInfo
{
    private readonly _invoke:        Function;
    private readonly _isConstructor: boolean;

    private _parameters:    ParameterInfo[] | null = null;

    public get invoke(): Function
    {
        return this._invoke;
    }

    public get isConstructor(): boolean
    {
        return this._isConstructor;
    }

    public get parameters(): ParameterInfo[]
    {
        if (!this._parameters)
        {
            const match = /^(?:(?:function\s+(?:\w+)?)|\w+)\(([^)]+)\)/.exec(this.invoke.toString());

            if (match)
            {
                const args = match[1].split(",").map(x => x.trim());

                const paramTypes = (this.metadata["design:paramtypes"] || []) as Object[];

                this._parameters = args.map((name, index) => new ParameterInfo(name, index, this, paramTypes[index]));
            }
            else
            {
                this._parameters = [];
            }
        }

        return this._parameters;
    }

    public constructor(key: string | symbol, descriptor: PropertyDescriptor, declaringType: Type, isOwn: boolean, isStatic: boolean)
    {
        super(key, descriptor, declaringType, isOwn, isStatic);

        this._invoke        = descriptor.value;
        this._isConstructor = !!descriptor.value.prototype;
    }
}