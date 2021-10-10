import type NodeFactory from "./node-factory.js";

type CustomElementDefinitionOptions =
{

    /** Element scoped custom directives */
    directives?: Record<string, DirectiveEntry>,

    /** Styles adopted by the shadow root. */
    style?: string | string[],

    /** Template used by the shadow root */
    template?: string | NodeFactory,
} & ElementDefinitionOptions;

export default CustomElementDefinitionOptions;