import path        from "path";
import * as common from "./common";

const file = path.parse(process.argv[2]);

let alias = file.name.replace(".spec", "");

if (alias == path.parse(path.resolve(file.dir, "../")).base)
{
    alias = "index";
}

common.execute(`cover ${file.name} tests`, `nyc --include ./**/${alias}.js --exclude tests/* --reporter=text mocha --ui tdd ${file.name}.js`);