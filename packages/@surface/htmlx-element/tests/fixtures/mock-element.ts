import element      from "../../internal/decorators/element.js";
import HTMLXElement from "../../internal/htmlx-element.js";

const template =
`
    <span>this value is: {host.value}</span>
    <span>Another Span</span>
`;

const style = ["span { color: green; }", "* { background: black; }"];

@element("mock-element", { style, template })
export default class MockElement extends HTMLXElement
{
    public value: number = 0;
}