import CustomElement from "../../internal/custom-element";
import { element }   from "../../internal/decorators";

@element("mock-element", "<span>this value is: {host.value}</span><span>Another Span</span>", "span { color: red; }")
export default class MockElement extends CustomElement
{
    public value: number = 0;

    public constructor()
    {
        super();
    }
}