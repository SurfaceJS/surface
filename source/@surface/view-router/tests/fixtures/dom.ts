// tslint:disable-next-line: no-import-side-effect
import "../../../custom-element/tests/fixtures/dom";

import { DOMWindow } from "jsdom";

declare global
{
    const windows: Array<DOMWindow>;
}