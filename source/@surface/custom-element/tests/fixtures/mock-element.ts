import CustomElement from "../../internal/custom-element";
import element       from "../../internal/decorators/element";

const template =
`
    <span>this value is: {host.value}</span>
    <span>Another Span</span>
`;

const style = "span { color: red; }";

@element("mock-element", template, style)
export default class MockElement extends CustomElement
{
    public value: number = 0;

    public constructor()
    {
        super();
    }
}