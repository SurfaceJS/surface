export type AttributeFilter   = (name: string, value: string, attributes: Map<string, string>) => boolean;
export type AttributeHandler  = { resolve: AttributeResolver, filter?: AttributeFilter };
export type AttributeHandlers = Record<string, Record<string, AttributeHandler>>;
export type AttributeResolver = (name: string, value: string, attributes: Map<string, string>) => string;
export type Handler           = { tag: string, attribute: string, type: "src" | "srcset", resolve?: AttributeResolver, filter?: AttributeFilter };