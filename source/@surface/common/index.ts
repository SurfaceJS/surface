export function templateParse(template: string, keys: { [key: string]: string }): string
{
    for (let key in keys)
        template = template.replace(new RegExp(`{{ *${key} *}}`, "g"), keys[key]);

    return template;
}