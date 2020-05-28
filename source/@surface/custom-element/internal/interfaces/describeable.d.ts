import ITemplateDescriptor from "./descriptors/template-descriptor";

export default interface IDescribeable
{
    descriptor: ITemplateDescriptor,
    path:       string;
}