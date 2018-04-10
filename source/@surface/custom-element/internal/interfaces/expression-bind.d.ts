import IExpression from "@surface/expression/interfaces/expression";
import BindingMode from "../binding-mode";

export default interface IExpressionBind
{
    bindingMode: BindingMode;
    expression:  IExpression;
}
