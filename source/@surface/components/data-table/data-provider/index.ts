import IDataProvider, { Criteria, Result } from "../interfaces/data-provider";

export default class DataProvider<T extends object> extends HTMLElement implements IDataProvider<T>
{
    public get createUrl(): string
    {
        return super.getAttribute("create-url") || "" as string;
    }

    public set createUrl(value: string)
    {
        super.setAttribute("create-url", value.toString());
    }

    public get deleteUrl(): string
    {
        return super.getAttribute("delete-url") || "" as string;
    }

    public set deleteUrl(value: string)
    {
        super.setAttribute("delete-url", value.toString());
    }

    public get readUrl(): string
    {
        return super.getAttribute("read-url") || "" as string;
    }

    public set readUrl(value: string)
    {
        super.setAttribute("read-url", value.toString());
    }

    public get updateUrl(): string
    {
        return super.getAttribute("update-url") || "" as string;
    }

    public set updateUrl(value: string)
    {
        super.setAttribute("update-url", value.toString());
    }

    public async create(data: T): Promise<void>
    {
        throw new Error("Method not implemented.");
    }

    public async delete(data: T): Promise<void>
    {
        throw new Error("Method not implemented.");
    }

    public async read(criteria: Criteria): Promise<Result<T>>
    {
        const response = await fetch
        (
            this.readUrl,
            {
                method: "POST",
                body:   JSON.stringify(criteria),
                headers:
                {
                    "Accept":       "application/json",
                    "Content-Type": "application/json"
                }
            }
        );

        return await response.json();
    }

    public async update(data: T): Promise<void>
    {
        throw new Error("Method not implemented.");
    }
}

window.customElements.define("surface-data-provider", DataProvider);