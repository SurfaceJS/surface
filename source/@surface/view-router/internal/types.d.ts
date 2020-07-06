import { Constructor } from "@surface/core";

export type Module<T> = { default: T };
export type Component = Constructor<HTMLElement> | Module<Constructor<HTMLElement>> | Promise<Constructor<HTMLElement> | Module<Constructor<HTMLElement>>>;