import type Activator from "./activator";

type TemplateFactory = { create: () => { content: Node, activator: Activator } };

export default TemplateFactory;