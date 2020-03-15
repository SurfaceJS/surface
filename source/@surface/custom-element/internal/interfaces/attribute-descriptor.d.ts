import IExpression from "@surface/expression/interfaces/expression";

export default interface IAttributeDescriptor
{
    expression: IExpression;
    key:        string;
    name:       string;
    type:       "oneway" | "twoway" | "event" | "interpolation";
}
