// eslint-disable-next-line import/no-unassigned-import
import "../../../custom-element/tests/fixtures/dom";

import { DOMWindow } from "jsdom";

declare global
{
    const windows: DOMWindow[];
}