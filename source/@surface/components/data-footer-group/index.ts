import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-data-footer-group", template, style)
export default class DataFooterGroup extends CustomElement
{ }