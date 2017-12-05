import { CustomElement } from "@surface/custom-element";

export abstract class View extends CustomElement
{
    protected $name: string;
    public get name(): string
    {
        return this.$name;
    }
}