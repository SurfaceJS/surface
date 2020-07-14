import { define } from "@surface/custom-element";

@define("router-slot")
export default class RouterSlot extends HTMLElement
{
    private slotedElement: HTMLElement | null = null;

    public set(element: HTMLElement): void
    {
        if (this.slotedElement)
        {
            this.replaceChild(element, this.slotedElement);
        }
        else
        {
            this.appendChild(element);
        }

        this.slotedElement = element;
    }

    public clear(): void
    {
        if (this.slotedElement)
        {
            this.slotedElement?.remove();

            this.slotedElement = null;
        }
    }
}