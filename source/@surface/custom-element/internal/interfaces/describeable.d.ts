import ITemplateDescriptor from "./template-descriptor";

export default interface IDescribeable
{
    descriptor: ITemplateDescriptor,
    path:       string;
}