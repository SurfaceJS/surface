import Reactive from "./internal/reactive.js";

export type { default as Subscription } from "./internal/types/subscription";

export { default as computed } from "./internal/decorators/computed.js";
export { default as notify }   from "./internal/decorators/notify.js";
export { default as observe }  from "./internal/decorators/observe.js";
export { default as Metadata } from "./internal/metadata.js";
export { default as Observer } from "./internal/observer.js";

export default Reactive;