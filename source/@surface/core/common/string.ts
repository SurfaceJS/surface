export function camelToText(value: string): string
{
    return value.split(/(?=[A-Z])/g).join(" ").toLowerCase();
}

export function dashedToCamel(value: string): string
{
    return value.replace(/-([a-z])/g, (value, group) => group.toUpperCase());
}

export function dashedToTitle(value: string): string
{
    return value.replace(/(^[a-z]|-[a-z])/g, (value, group) => group.replace(/-/g, "").toUpperCase());
}

export function toTitle(value: string): string
{
    return value.replace(/(^[a-z]|\s+[a-z])/g, (value, group) => group.toUpperCase());
}