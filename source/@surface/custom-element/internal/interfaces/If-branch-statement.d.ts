import IExpression         from "@surface/expression/interfaces/expression";
import ITemplateDescriptor from "./template-descriptor";

export default interface IIfStatementBranch
{
    descriptor: ITemplateDescriptor;
    expression: IExpression;
    path:       string;
}
