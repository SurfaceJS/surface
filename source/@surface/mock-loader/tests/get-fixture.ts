/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable import/no-commonjs */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

