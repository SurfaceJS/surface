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
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[]",
            "\t);",
            "",
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "", { }, true);

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
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
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
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<!-- This is a Comment -->", { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateTextNode(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateTextNodeFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
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
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "Hello World!!!", { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateElement(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"span\",",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span></span>", { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateElementAndAttributes(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"span\",",
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
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span foo bar=\"baz\"></span>", { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateImgWithSrc(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"img\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"src\", `${new URL(\"./foo.png\", import.meta.url)}`],",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<img src='./foo.png'></img>", { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateImgWithSrcSet(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"img\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"srcset\", `${new URL(\"./foo.800-600.png\", import.meta.url)} 800w 600h 1x, ${new URL(\"./foo.1920-1080.png\", import.meta.url)} 1920w 1080h 2x`],",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<img srcset='./foo.800-600.png 800w 600h 1x, ./foo.1920-1080.png 1920w 1080h 2x'></img>", { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateMetaWithMsApplicationTaskContent(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"meta\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"content\", \"foo.png\"],",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"meta\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"itemprop\", \"image\"],",
            "\t\t\t\t\t[\"content\", `${new URL(\"./foo.png\", import.meta.url)}`],",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"meta\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"name\", \"msapplication-task\"],",
            "\t\t\t\t\t[\"content\", \"\"],",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"meta\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"name\", \"msapplication-task\"],",
            "\t\t\t\t\t[\"content\", `name=Test;action-uri=https://test.com;icon-uri=${new URL(\"./favicon.ico\", import.meta.url)}`],",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const source =
        [
            "<meta content='foo.png'></meta>",
            "<meta itemprop='image' content='./foo.png'></meta>",
            "<meta name='msapplication-task' content=''></meta>",
            "<meta name='msapplication-task' content='name=Test;action-uri=https://test.com;icon-uri=./favicon.ico'></meta>",
        ].join("");

        const actual = SourceGenerator.generate("x-component", source, { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateLinkWithHref(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"link\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"href\", \"../styles.scss\"],",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"link\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"rel\", \"stylesheet\"],",
            "\t\t\t\t\t[\"href\", `${new URL(\"../styles.scss\", import.meta.url)}`],",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const source =
        [
            "<link href='../styles.scss'></link>",
            "<link rel='stylesheet' href='../styles.scss'></link>",
        ].join("");

        const actual = SourceGenerator.generate("x-component", source, { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateLinkWithItemprop(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"link\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"href\", \"../foo.png\"],",
            "\t\t\t\t\t[\"itemprop\", \"foo\"],",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"link\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"href\", `${new URL(\"../foo.png\", import.meta.url)}`],",
            "\t\t\t\t\t[\"itemprop\", \"image\"],",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const source =
        [
            "<link href='../foo.png' itemprop='foo'></link>",
            "<link href='../foo.png' itemprop='image'></link>",
        ].join("");

        const actual = SourceGenerator.generate("x-component", source, { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateScriptWithSrc(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"script\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"src\", \"../script.js\"],",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"script\",",
            "\t\t\t\t[",
            "\t\t\t\t\t[\"src\", `${new URL(\"../script.js\", import.meta.url)}`],",
            "\t\t\t\t\t[\"type\", \"module\"],",
            "\t\t\t\t],",
            "\t\t\t\tundefined,",
            "\t\t\t\tundefined,",
            "\t\t\t),",
            "\t\t]",
            "\t);",
            "",
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const source =
        [
            "<script src='../script.js'></script>",
            "<script src='../script.js' type=\"module\"></script>",
        ].join("");

        const actual = SourceGenerator.generate("x-component", source, { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateElementAndAttributesAndInterpolationBindDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tcreateInterpolationFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"span\",",
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
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span value=\"{host.value}\"></span>", { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateElementAndAttributesAndEventBindDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tcreateEventFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"span\",",
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
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span @click=\"host.handler\"></span>", { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateElementAndAttributesAndCustomBindDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tcreateDirectiveFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"span\",",
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
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span #show=\"host.show\"></span>", { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateElementAndAttributesAndOneWayBindDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tcreateOnewayFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"span\",",
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
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span :value=\"host.value\"></span>", { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateElementAndAttributesAndTwoWayBindDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateElementFactory,",
            "\tcreateTwowayFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreateElementFactory",
            "\t\t\t(",
            "\t\t\t\t\"span\",",
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
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span ::value=\"host.value\"></span>", { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateConditionalDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateChoiceFactory,",
            "\tcreateElementFactory,",
            "\tcreateTextNodeFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
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
            "\t\t\t\t\t\t\t\t\t\"span\",",
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
            "\t\t\t\t\t\t\t\t\t\"span\",",
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
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span #if=\"host.value\">Show</span><span #else>Hide</span>", { }, true);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateLoopDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateLoopFactory,",
            "\tcreateElementFactory,",
            "\tcreateTextNodeInterpolationFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
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
            "\t\t\t\t\t\t\t\"span\",",
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
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span #for=\"value of host.values\">Value: {value}</span>", { }, true);

        // writeFileSync("test.js", actual);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generatePlaceholderDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreatePlaceholderFactory,",
            "\tcreateElementFactory,",
            "\tcreateTextNodeInterpolationFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
            "",
            "const factory =",
            "\tcreateFragmentFactory",
            "\t(",
            "\t\t[",
            "\t\t\tcreatePlaceholderFactory",
            "\t\t\t(",
            "\t\t\t\tscope => \"default\",",
            "\t\t\t\tscope => ({ value: scope.host.value }),",
            "\t\t\t\t[[],[[\"host\",\"value\"]]],",
            "\t\t\t\tcreateFragmentFactory",
            "\t\t\t\t(",
            "\t\t\t\t\t[",
            "\t\t\t\t\t\tcreateElementFactory",
            "\t\t\t\t\t\t(",
            "\t\t\t\t\t\t\t\"span\",",
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
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span #placeholder=\"{ value: host.value }\">Value: {host.value}</span>", { }, true);

        // writeFileSync("test.js", actual);

        chai.assert.equal(actual, expected);
    }

    @test @shouldPass
    public generateInjectionDirective(): void
    {
        const expected =
        [
            "import",
            "{",
            "\tcreateFragmentFactory,",
            "\tcreateInjectionFactory,",
            "\tcreateElementFactory,",
            "\tcreateTextNodeInterpolationFactory,",
            "\tTemplateFactory,",
            "} from \"@surface/htmlx\";",
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
            "\t\t\t\t\t\t\t\"span\",",
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
            "export default new TemplateFactory(factory);",
        ].join("\n");

        const actual = SourceGenerator.generate("x-component", "<span #Inject=\"{ value }\">Value: {value}</span>", { }, true);

        // writeFileSync("test.js", actual);

        chai.assert.equal(actual, expected);
    }
}