export const dinamicKey    = /^\[(.*)\]$/;
export const forExpression = /(?:const|var|let)\s+(.*)\s+(in|of)\s+(.*)/;
export const interpolation = /(?<!(?<!\\)\\)(\{)(.*?)(\})/;