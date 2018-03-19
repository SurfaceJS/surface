import Enumerable    from "@surface/enumerable";
import { Nullable }  from "@surface/types";
import Type          from ".";
import MemberInfo    from "./member-info";
import ParameterInfo from "./parameter-info";

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
                let paramTypes = this.metadata.has("design:paramtypes") && this.metadata.get("design:paramtypes") || [];

                this._parameters = match[1].split(",")
                    .asEnumerable()
                    .zip(paramTypes as Array<Object>, (a, b) => ({ key: a, paramType: b }) )
                    .select(x => new ParameterInfo(x.key, this.invoke, this.declaringType, x.paramType));
            }
            else
            {
                this._parameters = Enumerable.empty();
            }
        }

        return this._parameters;
    }

    public constructor(key: string, invoke: Function, prototype: Object)
    {
        super(key, Type.from(prototype));

        this._invoke        = invoke;
        this._isConstructor = !!invoke.prototype;
    }
}