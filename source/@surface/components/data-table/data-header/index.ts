import CustomElement   from "@surface/custom-element";
import { element }     from "../../decorators";
import template        from "./index.html";
import style           from "./index.scss";

@element("surface-data-header", template, style)
export default class DataHeader extends CustomElement
{ }