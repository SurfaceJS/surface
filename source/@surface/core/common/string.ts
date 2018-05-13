export function camelToText(value: string): string
{
    return value.split(/(?=[A-Z])/).join(" ").toLowerCase();
}

export function dashedToCamel(value: string): string
{
    return value.replace(/-([a-z])/g, x => x[1].toUpperCase());
}