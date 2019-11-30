import "../mock-child";

import utils         from "jsdom/lib/jsdom/living/generated/utils";
import Impl          from "jsdom/lib/jsdom/living/nodes/Node-impl";
import CustomElement from "../../..";
import { element }   from "../../../decorators";

@element("mock-parent", "<mock-child ::value='host.value'></mock-child>")
export default class MockParent extends CustomElement
{
    public [utils.implSymbol]: object;

    public value: number = 0;

    public constructor()
    {
        super();

        this[utils.implSymbol] = new Impl.implementation([], { ownerDocument: window.document });
    }
}