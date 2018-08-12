import Tasks         from ".";
import { MethodsOf } from "./types";

const [action, parameter] = process.argv.slice(2) as  [MethodsOf<typeof Tasks>, string];

Tasks[action].apply(Tasks, (parameter || "").split(","));