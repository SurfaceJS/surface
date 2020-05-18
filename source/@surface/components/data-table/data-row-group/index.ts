import CustomElement from "@surface/custom-element";
import Enumerable    from "@surface/enumerable";
import { element }   from "../../decorators";
import DataRow       from "../data-row";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-data-row-group", template, style)
export default class DataRowGroup extends CustomElement
{
    public get rows(): Enumerable<DataRow>
    {
        return Enumerable.from(Array.from(super.querySelectorAll("surface-data-row-group > surface-data-row")));
    }
}