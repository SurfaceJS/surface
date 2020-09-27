import Reactive from "./internal/reactive";

export type { default as IListener }             from "./internal/interfaces/listener";
export type { default as IObserver }             from "./internal/interfaces/observer";
export type { default as IPropertyListener }     from "./internal/interfaces/property-listener";
export type { default as IPropertySubscription } from "./internal/interfaces/property-subscription";
export type { default as IReactor }              from "./internal/interfaces/reactor";
export type { default as ISubscription }         from "./internal/interfaces/subscription";

export { default as PropertyListener }     from "./internal/property-listener";
export { default as PropertySubscription } from "./internal/property-subscription";

export * from "./internal/decorators";

export default Reactive;