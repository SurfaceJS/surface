import type Activator from "./activator.js";

type NodeFactory = () => [Node, Activator];

export default NodeFactory;