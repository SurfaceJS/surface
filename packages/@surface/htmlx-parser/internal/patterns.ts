export const dynamicKey    = /^\[(.*)\]$/;
export const forExpression = /^\s*(?:(?:var|let|const)\s+)?(\w+|\S.*\S)\s+(in|of)\s+(\w+|\S.*\S)$/s;
export const interpolation = /(?<!(?<!\\)\\)(\{)(.*?)(\})/;
