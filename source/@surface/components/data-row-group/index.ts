import CustomElement   from "@surface/custom-element";
import { element }     from "@surface/custom-element/decorators";
import template        from "./index.html";
import style           from "./index.scss";

@element("surface-data-row-group", template, style)
export default class DataRowGroup extends CustomElement
{ }