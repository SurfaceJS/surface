// eslint-disable-next-line import/no-unassigned-import
import "@surface/custom-element/tests/fixtures/dom.js";

import type { DOMWindow } from "jsdom";

declare global
{
    const windows: DOMWindow[];
}