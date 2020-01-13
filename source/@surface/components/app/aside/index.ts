import { element } from "@surface/custom-element/decorators";
import Component   from "../..";
import template    from "./index.html";
import style       from "./index.scss";

@element("surface-app-aside", template, style)
export default class AppAside extends Component
{ }