import Component   from "../..";
import { element } from "../../decorators";
import template    from "./index.html";
import style       from "./index.scss";

@element("surface-app-toogle", template, style)
export default class AppToogle extends Component
{ }