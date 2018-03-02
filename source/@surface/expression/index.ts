import IExpression from "./interfaces/expression";
import Parser      from "./internal/parser";

export default abstract class Expression
{
    public static from(source: string, context?: Object): IExpression
    {
        return Parser.parse(source, context || { });
    }
}