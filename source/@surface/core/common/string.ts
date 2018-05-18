export function camelToText(value: string): string
{
    return value.split(/(?=[A-Z])/).join(" ").toLowerCase();
}

export function dashedToCamel(value: string): string
{
    return value.replace(/-([a-z])/g, x => x[0].toUpperCase());
}

export function dashedToTitle(value: string): string
{
    return value.replace(/(^[a-z]|-[a-z])/g, x => x[0].replace(/-/g, "").toUpperCase());
}