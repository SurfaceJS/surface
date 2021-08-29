import choiceFactory      from "./factories/choice-factory.js";
import elementFactory     from "./factories/element-factory.js";
import fragmentFactory    from "./factories/fragment-factory.js";
import injectionFactory   from "./factories/injection-factory.js";
import loopFactory        from "./factories/loop-factory.js";
import placeholderFactory from "./factories/placeholder-factory.js";
import textNodeFactory    from "./factories/text-node-factory.js";
import commentFactory     from "./factories/comment-factory.js";
import TemplateParser     from "./template-parser.js";
import type Descriptor    from "./types/descriptor.js";
import type Factory       from "./types/fatctory.js";

export default class TemplateCompiler extends TemplateParser
{
    private static compileDescriptor(descriptor: Descriptor): Factory
    {
        switch (descriptor.type)
        {
            case "element":
                return elementFactory
                (
                    descriptor.tag,
                    descriptor.attributes.map(x => [x.key, x.value]),
                    descriptor.binds.map(x => [x.type, x.key, scope => x.value.evaluate(scope), x.observables]),
                    descriptor.events.map(x => [x.key, scope => x.value.evaluate(scope)]),
                    descriptor.directives.map(([keyExpression, expression, observables]) => [scope => keyExpression.evaluate(scope), scope => expression.evaluate(scope), observables]),
                    descriptor.childs.map(x => TemplateCompiler.compileDescriptor(x)),
                );
            case "text":
                return textNodeFactory
                (
                    scope => String(descriptor.value.evaluate(scope)),
                    descriptor.observables,
                );
            case "choice-statement":
                return choiceFactory
                (
                    descriptor.branches.map(x => ({ expression: x.expression, factory: TemplateCompiler.compileDescriptor(x.descriptor), observables: x.observables })),
                );
            case "loop-statement":
                return loopFactory
                (
                    (scope, value) => descriptor.left.evaluate(scope, value) as object,
                    descriptor.operator,
                    scope => descriptor.right.evaluate(scope),
                    descriptor.observables,
                    TemplateCompiler.compileDescriptor(descriptor.descriptor),
                );
            case "placeholder-statement":
                return placeholderFactory
                (
                    scope => String(descriptor.key.evaluate(scope)),
                    scope => descriptor.value.evaluate(scope),
                    [descriptor.observables.key, descriptor.observables.value],
                    TemplateCompiler.compileDescriptor(descriptor.descriptor),
                );
            case "injection-statement":
                return injectionFactory
                (
                    scope => String(descriptor.key.evaluate(scope)),
                    (scope, value) => descriptor.value.evaluate(scope, value),
                    [descriptor.observables.key, descriptor.observables.value],
                    TemplateCompiler.compileDescriptor(descriptor.descriptor),
                );
            case "comment":
                return commentFactory(descriptor.value);
            case "fragment":
            default:
                return fragmentFactory
                (
                    descriptor.childs.map(x => TemplateCompiler.compileDescriptor(x)),
                );
        }
    }

    public static compile(name: string, template: string): Factory
    {
        const descriptor = TemplateParser.parse(name, template);

        return TemplateCompiler.compileDescriptor(descriptor);
    }
}