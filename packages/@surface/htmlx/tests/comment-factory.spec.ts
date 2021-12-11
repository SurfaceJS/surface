// eslint-disable-next-line import/no-unassigned-import
import "@surface/dom-shim";

import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import createCommentFactory        from "../internal/factories/create-comment-factory.js";
import customDirectiveFactory      from "./fixtures/custom-directive-factory.js";
import CustomDirective             from "./fixtures/custom-directive.js";

const globalCustomDirectives = new Map();

globalCustomDirectives.set("custom", CustomDirective);
globalCustomDirectives.set("custom-factory", customDirectiveFactory);

@suite
export default class CommentFactorySpec
{
    @test @shouldPass
    public create(): void
    {
        const [element] = createCommentFactory("This is a comment")();

        chai.assert.equal(element.nodeType, Node.COMMENT_NODE);
        chai.assert.equal(element.textContent, "This is a comment");
    }
}