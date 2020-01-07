import Component   from "..";
import { element } from "../decorators";
import template    from "./index.html";
import style       from "./index.scss";

@element("surface-app", template, style)
export default class App extends Component
{ }