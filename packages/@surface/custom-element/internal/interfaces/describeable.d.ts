import type TemplateDescriptor from "../types/template-descriptor-legacy";

export default interface IDescribeable
{
    descriptor: TemplateDescriptor;
    path:       string;
}