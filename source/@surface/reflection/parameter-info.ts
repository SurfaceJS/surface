import Dictionary   from "@surface/collection/dictionary";
import { Nullable } from "@surface/types";
import Type         from ".";
import MemberInfo   from "./member-info";

export default class ParameterInfo extends MemberInfo
{
    private _declaringMethod: Function;
    public get declaringMethod(): Function
    {
        return this._declaringMethod;
    }

    public constructor(key: string, declaringMethod: Function, declaringType: Type, paramType: Nullable<Object>)
    {
        super(key, declaringType);

        this._declaringMethod = declaringMethod;

        if (paramType)
        {
            this._metadata = Dictionary.of({ "design:type": paramType });
        }
    }
}