export function templateParse(template: string, keys: LiteralObject<string>): string
{
    for (let key in keys)
        template = template.replace(new RegExp(`{{ *${key} *}}`, "g"), keys[key]);

    return template;
}

export function getModule(path: string): string
{
    let slices = path.split('/').reverse();
    if (slices.length > 1 && slices[0].match(/index.[tj]s/))
        return slices[1];
    else
        return slices[0];
}