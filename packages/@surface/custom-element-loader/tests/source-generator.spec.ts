// import { writeFileSync }           from "fs";
import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import SourceGenerator             from "../internal/source-generator.js";

@suite
export default class SourceGeneratorSpec
{
    @test @shouldPass
    public generateEmpty(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "} from \"@surface/custom-element\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[]",
            "\t);",
            "",
            "export default factory;",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateComment(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateCommentFactory,",
            "} from \"@surface/custom-element\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateCommentFactory",
            "\t\t\t(",
            "\t\t\t\t\" This is a Comment \"",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default factory;",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<!-- This is a Comment -->", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateWithTextNode(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateTextNodeFactory,",
            "} from \"@surface/custom-element\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateTextNodeFactory",
            "\t\t\t(",
            "\t\t\t\t\"Hello World!!!\"",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default factory;",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "Hello World!!!", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateWithElement(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "} from \"@surface/custom-element\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"SPAN\",",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default factory;",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span></span>", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateWithElementAndAttributes(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "} from \"@surface/custom-element\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"SPAN\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"foo\", \"\"],",
            "\t\t\t\t\t[\"bar\", \"baz\"],",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default factory;",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span foo bar=\"baz\"></span>", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateWithElementAndAttributesAndInterpolationBindDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tcreateInterpolationFactory,",
            "} from \"@surface/custom-element\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"SPAN\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"value\", \"\"],",
            "\t\t\t\t],",
            "\t\t\t\t[",
            "\t\t\t\t\tcreateInterpolationFactory",
            "\t\t\t\t\t(",
            "\t\t\t\t\t\t\"value\",",
            "\t\t\t\t\t\tscope => `${scope.host.value}`,",
            "\t\t\t\t\t\t[[\"host\",\"value\"]],",
            "\t\t\t\t\t\t\"value=\\\"{host.value}\\\"\",",
            "\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span value=\\\"{host.value}\\\">\"]],",
            "\t\t\t\t\t),",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default factory;",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span value=\"{host.value}\"></span>", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateWithElementAndAttributesAndEventBindDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tcreateEventFactory,",
            "} from \"@surface/custom-element\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"SPAN\",",
            "\t\t\t\tundefined,",
            "\t\t\t\t[",
            "\t\t\t\t\tcreateEventFactory",
            "\t\t\t\t\t(",
            "\t\t\t\t\t\t\"click\",",
            "\t\t\t\t\t\tscope => scope.host.handler,",
            "\t\t\t\t\t\tscope => scope.host,",
            "\t\t\t\t\t\t\"@click=\\\"host.handler\\\"\",",
            "\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span @click=\\\"host.handler\\\">\"]],",
            "\t\t\t\t\t),",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default factory;",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span @click=\"host.handler\"></span>", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateWithElementAndAttributesAndCustomBindDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tcreateDirectiveFactory,",
            "} from \"@surface/custom-element\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"SPAN\",",
            "\t\t\t\tundefined,",
            "\t\t\t\t[",
            "\t\t\t\t\tcreateDirectiveFactory",
            "\t\t\t\t\t(",
            "\t\t\t\t\t\t\"show\",",
            "\t\t\t\t\t\tscope => scope.host.show,",
            "\t\t\t\t\t\t[[\"host\",\"show\"]],",
            "\t\t\t\t\t\t\"#show=\\\"host.show\\\"\",",
            "\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span #show=\\\"host.show\\\">\"]],",
            "\t\t\t\t\t),",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default factory;",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span #show=\"host.show\"></span>", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateWithElementAndAttributesAndOneWayBindDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tcreateOnewayFactory,",
            "} from \"@surface/custom-element\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"SPAN\",",
            "\t\t\t\tundefined,",
            "\t\t\t\t[",
            "\t\t\t\t\tcreateOnewayFactory",
            "\t\t\t\t\t(",
            "\t\t\t\t\t\t\"value\",",
            "\t\t\t\t\t\tscope => scope.host.value,",
            "\t\t\t\t\t\t[[\"host\",\"value\"]],",
            "\t\t\t\t\t\t\":value=\\\"host.value\\\"\",",
            "\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span :value=\\\"host.value\\\">\"]],",
            "\t\t\t\t\t),",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default factory;",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span :value=\"host.value\"></span>", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateWithElementAndAttributesAndTwoWayBindDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tcreateTwowayFactory,",
            "} from \"@surface/custom-element\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"SPAN\",",
            "\t\t\t\tundefined,",
            "\t\t\t\t[",
            "\t\t\t\t\tcreateTwowayFactory",
            "\t\t\t\t\t(",
            "\t\t\t\t\t\t\"value\",",
            "\t\t\t\t\t\t[\"host\",\"value\"],",
            "\t\t\t\t\t\t\"::value=\\\"host.value\\\"\",",
            "\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span ::value=\\\"host.value\\\">\"]],",
            "\t\t\t\t\t),",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default factory;",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span ::value=\"host.value\"></span>", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateWithConditionalDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateChoiceFactory,",
            "\tcreateElementFactory,",
            "\tcreateTextNodeFactory,",
            "} from \"@surface/custom-element\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateChoiceFactory",
            "\t\t\t(",
            "\t\t\t\t[",
            "\t\t\t\t\t[",
            "\t\t\t\t\t\tscope => scope.host.value,",
            "\t\t\t\t\t\t[[\"host\",\"value\"]],",
            "\t\t\t\t\t\tcreateFragmentFactory",
            "\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t[",
            "\t\t\t\t\t\t\t\tcreateElementFactory",
            "\t\t\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\t\t\"SPAN\",",
            "\t\t\t\t\t\t\t\t\tundefined,",
            "\t\t\t\t\t\t\t\t\tundefined,",
            "\t\t\t\t\t\t\t\t\t[",
            "\t\t\t\t\t\t\t\t\t\tcreateTextNodeFactory",
            "\t\t\t\t\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\t\t\t\t\"Show\"",
            "\t\t\t\t\t\t\t\t\t\t),",
            "\t\t\t\t\t\t\t\t\t],",
            "\t\t\t\t\t\t\t\t),",
            "\t\t\t\t\t\t\t]",
            "\t\t\t\t\t\t),",
            "\t\t\t\t\t\t\"#if=\\\"host.value\\\"\",",
            "\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span #if=\\\"host.value\\\">\"]],",
            "\t\t\t\t\t],",
            "\t\t\t\t\t[",
            "\t\t\t\t\t\tscope => true,",
            "\t\t\t\t\t\t[],",
            "\t\t\t\t\t\tcreateFragmentFactory",
            "\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t[",
            "\t\t\t\t\t\t\t\tcreateElementFactory",
            "\t\t\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\t\t\"SPAN\",",
            "\t\t\t\t\t\t\t\t\tundefined,",
            "\t\t\t\t\t\t\t\t\tundefined,",
            "\t\t\t\t\t\t\t\t\t[",
            "\t\t\t\t\t\t\t\t\t\tcreateTextNodeFactory",
            "\t\t\t\t\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\t\t\t\t\"Hide\"",
            "\t\t\t\t\t\t\t\t\t\t),",
            "\t\t\t\t\t\t\t\t\t],",
            "\t\t\t\t\t\t\t\t),",
            "\t\t\t\t\t\t\t]",
            "\t\t\t\t\t\t),",
            "\t\t\t\t\t\t\"#else\",",
            "\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"...1 other(s) node(s)\",\"<span #else>\"]],",
            "\t\t\t\t\t],",
            "\t\t\t\t]",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default factory;",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span #if=\"host.value\">Show</span><span #else>Hide</span>", false);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateWithLoopDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateLoopFactory,",
            "\tcreateElementFactory,",
            "\tcreateTextNodeInterpolationFactory,",
            "} from \"@surface/custom-element\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateLoopFactory",
            "\t\t\t(",
            "\t\t\t\t(scope, value) => ({ value: value }),",
            "\t\t\t\t\"of\",",
            "\t\t\t\tscope => scope.host.values,",
            "\t\t\t\t[[\"host\",\"values\"]],",
            "\t\t\t\tcreateFragmentFactory",
            "\t\t\t\t(",
            "\t\t\t\t\t[",
            "\t\t\t\t\t\tcreateElementFactory",
            "\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\"SPAN\",",
            "\t\t\t\t\t\t\tundefined,",
            "\t\t\t\t\t\t\tundefined,",
            "\t\t\t\t\t\t\t[",
            "\t\t\t\t\t\t\t\tcreateTextNodeInterpolationFactory",
            "\t\t\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\t\tscope => `Value: ${scope.value}`,",
            "\t\t\t\t\t\t\t\t\t[],",
            "\t\t\t\t\t\t\t\t\t\"Value: {value}\",",
            "\t\t\t\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span #for=\\\"value of host.values\\\">\"],[\"Value: {value}\"]],",
            "\t\t\t\t\t\t\t\t),",
            "\t\t\t\t\t\t\t],",
            "\t\t\t\t\t\t),",
            "\t\t\t\t\t]",
            "\t\t\t\t),",
            "\t\t\t\t\"#for=\\\"value of host.values\\\"\",",
            "\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span #for=\\\"value of host.values\\\">\"]],",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default factory;",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span #for=\"value of host.values\">Value: {value}</span>", false);

        // writeFileSync("test.js", actual);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateWithPlaceholderDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreatePlaceholderFactory,",
            "\tcreateElementFactory,",
            "\tcreateTextNodeInterpolationFactory,",
            "} from \"@surface/custom-element\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreatePlaceholderFactory",
            "\t\t\t(",
            "\t\t\t\tscope => \"default\",",
            "\t\t\t\tscope => { value: scope.host.value },",
            "\t\t\t\t[[],[[\"host\",\"value\"]]],",
            "\t\t\t\tcreateFragmentFactory",
            "\t\t\t\t(",
            "\t\t\t\t\t[",
            "\t\t\t\t\t\tcreateElementFactory",
            "\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\"SPAN\",",
            "\t\t\t\t\t\t\tundefined,",
            "\t\t\t\t\t\t\tundefined,",
            "\t\t\t\t\t\t\t[",
            "\t\t\t\t\t\t\t\tcreateTextNodeInterpolationFactory",
            "\t\t\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\t\tscope => `Value: ${scope.host.value}`,",
            "\t\t\t\t\t\t\t\t\t[[\"host\",\"value\"]],",
            "\t\t\t\t\t\t\t\t\t\"Value: {host.value}\",",
            "\t\t\t\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span #placeholder=\\\"{ value: host.value }\\\">\"],[\"Value: {host.value}\"]],",
            "\t\t\t\t\t\t\t\t),",
            "\t\t\t\t\t\t\t],",
            "\t\t\t\t\t\t),",
            "\t\t\t\t\t]",
            "\t\t\t\t),",
            "\t\t\t\t{\"key\":\"\",\"value\":\"#placeholder=\\\"{ value: host.value }\\\"\"},",
            "\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span #placeholder=\\\"{ value: host.value }\\\">\"]],",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default factory;",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span #placeholder=\"{ value: host.value }\">Value: {host.value}</span>", false);

        // writeFileSync("test.js", actual);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateWithInjectionDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateInjectionFactory,",
            "\tcreateElementFactory,",
            "\tcreateTextNodeInterpolationFactory,",
            "} from \"@surface/custom-element\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateInjectionFactory",
            "\t\t\t(",
            "\t\t\t\tscope => \"default\",",
            "\t\t\t\t(__scope__, __value__) => { const { value } = __value__; return { value }; },",
            "\t\t\t\t[[],[]],",
            "\t\t\t\tcreateFragmentFactory",
            "\t\t\t\t(",
            "\t\t\t\t\t[",
            "\t\t\t\t\t\tcreateElementFactory",
            "\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\"SPAN\",",
            "\t\t\t\t\t\t\tundefined,",
            "\t\t\t\t\t\t\tundefined,",
            "\t\t\t\t\t\t\t[",
            "\t\t\t\t\t\t\t\tcreateTextNodeInterpolationFactory",
            "\t\t\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\t\tscope => `Value: ${scope.value}`,",
            "\t\t\t\t\t\t\t\t\t[],",
            "\t\t\t\t\t\t\t\t\t\"Value: {value}\",",
            "\t\t\t\t\t\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span #inject=\\\"{ value }\\\">\"],[\"Value: {value}\"]],",
            "\t\t\t\t\t\t\t\t),",
            "\t\t\t\t\t\t\t],",
            "\t\t\t\t\t\t),",
            "\t\t\t\t\t]",
            "\t\t\t\t),",
            "\t\t\t\t{\"key\":\"\",\"value\":\"#inject=\\\"{ value }\\\"\"},",
            "\t\t\t\t[[\"<x-component>\"],[\"#shadow-root\"],[\"<span #inject=\\\"{ value }\\\">\"]],",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default factory;",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span #Inject=\"{ value }\">Value: {value}</span>", false);

        // writeFileSync("test.js", actual);

        chai.assert.equal(actual, expected);
    }
}