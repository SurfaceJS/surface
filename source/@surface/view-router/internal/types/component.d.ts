import { Constructor } from "@surface/core";
import Module          from "./module";

type Component = Constructor<HTMLElement> | Module<Constructor<HTMLElement>> | Promise<Constructor<HTMLElement> | Module<Constructor<HTMLElement>>>;

export default Component;
