import Tasks         from ".";
import { MethodsOf } from "./types";

const [action, parameters] = process.argv.slice(2) as [MethodsOf<typeof Tasks>, string];

// tslint:disable-next-line:no-any
Tasks[action].apply<any, any, any>(Tasks, (parameters || "").split(","));