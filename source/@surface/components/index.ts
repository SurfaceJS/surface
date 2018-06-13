import CustomElement from "@surface/custom-element";

export default abstract class Component extends CustomElement
{
    public get horizontalAlignment(): string
    {
        return super.getAttribute("horizontalAlignment") || "" as string;
    }

    public set horizontalAlignment(value: string)
    {
        super.setAttribute("horizontalAlignment", value);
    }

    public get verticalAlignment(): string
    {
        return super.getAttribute("verticalAlignment") || "" as string;
    }

    public set verticalAlignment(value: string)
    {
        super.setAttribute("verticalAlignment", value);
    }
}