/* eslint-disable import/no-namespace */
import fs           from "fs";
import * as fixture from "./fixture.js";

export function getCommonJS(): typeof fs
{
    return fs;
}

export function getESM(): typeof fixture
{
    return fixture;
}

