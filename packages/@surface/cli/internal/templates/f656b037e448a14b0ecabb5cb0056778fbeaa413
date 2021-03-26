import CustomElement, { attribute, element } from "@surface/custom-element";
import template                              from "./index.html";
import style                                 from "./index.scss";

@element("app-text-input", template, style)
export default class TextInput extends CustomElement
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