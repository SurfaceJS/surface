import Container from "./internal/container.js";

export type { default as IScopedProvider } from "./internal/interfaces/scoped-provider.js";

export { default as inject }  from "./internal/decorators/inject.js";
export { default as provide } from "./internal/decorators/provide.js";

export default Container;