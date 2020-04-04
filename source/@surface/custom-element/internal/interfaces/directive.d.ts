import IExpression from "@surface/expression/interfaces/expression";

export default interface IDirective
{
    expression: IExpression;
    key:        IExpression;
    name:       string;
}