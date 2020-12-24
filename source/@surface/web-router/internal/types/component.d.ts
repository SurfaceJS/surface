import type { Constructor } from "@surface/core";
import type Module          from "./module";

type Component = Constructor<HTMLElement> | Module<Constructor<HTMLElement>> | Promise<Constructor<HTMLElement> | Module<Constructor<HTMLElement>>>;

export default Component;
