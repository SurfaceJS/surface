import CustomElement from "../../internal/custom-element.js";
import element       from "../../internal/decorators/element.js";

const template =
`
    <span>this value is: {host.value}</span>
    <span>Another Span</span>
`;

const style = "span { color: red; }";

@element("mock-element", { style, template })
export default class MockElement extends CustomElement
{
    public value: number = 0;

    public constructor()
    {
        super();
    }
}