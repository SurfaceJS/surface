import { Unknown }        from "@surface/types";
import IExpression        from "./interfaces/expression";
import ArrayExpression    from "./internal/expressions/array-expression";
import CallExpression     from "./internal/expressions/call-expression";
import ConstantExpression from "./internal/expressions/constant-expression";
import Parser             from "./internal/parser";

export default abstract class Expression
{
    public static from(source: string, context?: Object): IExpression
    {
        return Parser.parse(source, context || { });
    }

    public static array(elements: Array<IExpression>)
    {
        return new ArrayExpression(elements);
    }

    public static call(context: IExpression, name: string, args: Array<IExpression>)
    {
        return new CallExpression(context, name, args);
    }

    public static constant(value: Unknown): IExpression
    {
        return new ConstantExpression(value);
    }
}