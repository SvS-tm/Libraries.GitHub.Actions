export type StringLike = string | { toString(): string; } | (() => string);
