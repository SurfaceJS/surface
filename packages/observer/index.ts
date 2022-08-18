import Observer from "./internal/observer.js";

export type { Subscription } from "@surface/core";

export { default as computed } from "./internal/decorators/computed.js";
export { default as listener } from "./internal/decorators/listener.js";
export { default as Metadata } from "./internal/metadata.js";

export default Observer;