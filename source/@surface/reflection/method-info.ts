import Enumerable    from "@surface/enumerable";
import { Nullable }  from "@surface/types";
import MemberInfo    from "./member-info";
import ParameterInfo from "./parameter-info";
import Type          from "./type";

export default class MethodInfo extends MemberInfo
{
    private _invoke: Function;
    public get invoke(): Function
    {
        return this._invoke;
    }

    private _isConstructor: boolean;
    public get isConstructor(): boolean
    {
        return this._isConstructor;
    }

    private _parameters: Nullable<Enumerable<ParameterInfo>>;
    public get parameters(): Enumerable<ParameterInfo>
    {
        if (!this._parameters)
        {
            let match = /^(?:(?:function\s+(?:\w+)?)|\w+)\(([^)]+)\)/.exec(this.invoke.toString());

            if (match)
            {
                const args = match[1].split(",").map(x => x.trim());

                const paramTypes = (this.metadata.has("design:paramtypes") ?
                    this.metadata.get("design:paramtypes") :
                    new Array(args.length)) as Array<Object>;

                this._parameters = args
                    .asEnumerable()
                    .zip(paramTypes, (a, b) => ({ key: a, paramType: b }))
                    .select((element, index) => new ParameterInfo(element.key, index, this, element.paramType));
            }
            else
            {
                this._parameters = Enumerable.empty();
            }
        }

        return this._parameters;
    }

    public constructor(key: string, invoke: Function, declaringType: Type, isStatic: boolean)
    {
        super(key, declaringType, isStatic);

        this._invoke        = invoke;
        this._isConstructor = !!invoke.prototype;
    }
}