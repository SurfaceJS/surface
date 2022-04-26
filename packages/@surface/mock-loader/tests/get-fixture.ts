/* eslint-disable import/no-namespace */
import fs           from "fs";
import util         from "util";
import * as fixture from "./fixture.js";

export function getFs(): typeof fs
{
    return fs;
}

export function getUtil(): typeof util
{
    return util;
}

export function getFixture(): typeof fixture
{
    return fixture;
}

