import type { IDisposable } from "@surface/core";

type SpreadFactory = (source: HTMLElement, target: HTMLElement) => IDisposable;

export default SpreadFactory;
