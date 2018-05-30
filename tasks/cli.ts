import Tasks from ".";

const [action, parameter] = process.argv.slice(2) as  [string, string];

Tasks[action].apply(Tasks, (parameter || "").split(","));