import type TemplateDescriptor from "../types/template-descriptor";

export default interface IDescribeable
{
    descriptor: TemplateDescriptor;
    path:       string;
}