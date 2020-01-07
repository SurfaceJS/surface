import Component   from "..";
import { element } from "../decorators";
import template    from "./index.html";

@element("surface-app", template)
export default class App extends Component
{ }