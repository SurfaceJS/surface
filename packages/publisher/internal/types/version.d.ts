type Build           = `+${string}`;
type PreId           = `-${string}`;
type Prerelease      = PreId | Build;

export type SemanticVersion = `${number}.${number}.${number}${Prerelease | ""}`;
export type GlobPrerelease  = `*${Prerelease}`;
