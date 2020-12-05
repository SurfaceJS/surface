import Reactive from "./internal/reactive";

export type { default as Subscription } from "./internal/types/subscription";

export { default as computed } from "./internal/decorators/computed";
export { default as notify }   from "./internal/decorators/notify";
export { default as observe }  from "./internal/decorators/observe";
export { default as Metadata } from "./internal/metadata";
export { default as Observer } from "./internal/observer";

export default Reactive;