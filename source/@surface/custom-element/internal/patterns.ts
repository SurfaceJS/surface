export const dinamicKey    = /^\[(.*)\]$/;
export const forExpression = /^\s*(?:(?:var|let|const)\s+)?(\S.*\S)\s+(in|of)\s+(\S.*\S)$/s;
export const interpolation = /(?<!(?<!\\)\\)(\{)(.*?)(\})/;