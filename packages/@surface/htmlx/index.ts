/* eslint-disable @typescript-eslint/indent */
import Compiler from "./internal/compiler.js";

export type
{
    DirectiveConstructor,
    DirectiveFactory,
} from "./internal/types/directive-entry.js";

export type { default as Activator }             from "./internal/types/activator.js";
export type { default as AttributeFactory }      from "./internal/types/attribute-factory.js";
export type { default as ChoiceBranch }          from "./internal/types/choice-branch.js";
export type { default as DestructuredEvaluator } from "./internal/types/destructured-evaluator.js";
export type { default as DirectiveContext }      from "./internal/types/directive-context.js";
export type { default as DirectiveEntry }        from "./internal/types/directive-entry.js";
export type { default as Evaluator }             from "./internal/types/evaluator.js";
export type { default as InjectionContext }      from "./internal/types/injection-context.js";
export type { default as NodeFactory }           from "./internal/types/node-factory.js";

export { default as AsyncObserver } from "./internal/reactivity/async-observer.js";
export { default as Directive }     from "./internal/directives/directive.js";
export { scheduler, painting }      from "./internal/singletons.js";

export * from "./internal/factories/index.js";

export default Compiler;