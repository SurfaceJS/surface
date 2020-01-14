import { element } from "@surface/custom-element/decorators";
import Component   from "..";
import template    from "./index.html";
import style       from "./index.scss";

@element("smd-app-bar", template, style)
export default class AppBar extends Component
{ }