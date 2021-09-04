import type Activator from "./activator";

type NodeFactory = () => [Node, Activator];

export default NodeFactory;