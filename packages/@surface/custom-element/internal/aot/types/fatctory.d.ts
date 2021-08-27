import type Activator from "./activator";

type Factory = () => [Node, Activator];

export default Factory;