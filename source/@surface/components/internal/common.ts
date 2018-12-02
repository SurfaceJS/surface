export function setGlobalStyle(id: string, style: string): void
{
    let styleElement = document.head.querySelector(`style#${id}`);

    if (!styleElement)
    {
        styleElement           = document.createElement("style");
        styleElement.id        = id;
        styleElement.innerHTML = style;

        document.head.appendChild(styleElement);
    }
    else
    {
        styleElement.innerHTML += "\n" + style;
    }
}