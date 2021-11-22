import HTMLXElement, { attribute, element } from "@surface/htmlx-element";
import template                             from "./index.htmlx";
import style                                from "./index.scss";

@element("app-text-input", { template, style })
export default class TextInput extends HTMLXElement
{
    @attribute
    public error = "";

    @attribute
    public label = "Label";

    @attribute
    public type = "";

    @attribute
    public value = "";
}