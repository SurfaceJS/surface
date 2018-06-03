import Observer        from "@surface/core/observer";
import CustomElement   from "@surface/custom-element";
import { element }     from "@surface/custom-element/decorators";
import Enumerable      from "@surface/enumerable";
import DataCell        from "../data-cell";
import DataFooterGroup from "../data-footer-group";
import DataHeaderGroup from "../data-header-group";
import DataRow         from "../data-row";
import DataRowGroup    from "../data-row-group";
import DataTemplate    from "../data-template";
import template        from "./index.html";
import style           from "./index.scss";

@element("surface-data-table", template, style)
export default class DataTable extends CustomElement
{
    public get dataFooterGroups(): Enumerable<DataFooterGroup>
    {
        return super.queryAll("surface-data-footer");
    }

    public get dataHeaderGroups(): Enumerable<DataHeaderGroup>
    {
        return super.queryAll("surface-data-header-group");
    }

    public get dataRowGroups(): Enumerable<DataRowGroup>
    {
        return super.queryAll("surface-data-row-group");
    }

    private readonly _onDatasourceChange: Observer = new Observer();
    public get onDatasourceChange(): Observer
    {
        return this._onDatasourceChange;
    }

    private _datasource: Iterable<Object> = [];
    public get datasource(): Iterable<Object>
    {
        return this._datasource;
    }

    public set datasource(value: Iterable<Object>)
    {
        if (!Object.is(value, this._datasource))
        {
            this._datasource = value;
            this.applyDataBind();
            this.onDatasourceChange.notify(value);
        }
    }

    private applyDataBind()
    {
        const dataTemplate = super.query<HTMLTemplateElement>("template");

        if (dataTemplate)
        {
            const content = document.importNode(dataTemplate.content, true);

            const dataTemplates = Array.from(content.querySelectorAll("surface-data-template")) as Array<DataTemplate>;

            this.prepareHeaders(dataTemplates);
            this.prepareRows(dataTemplates);
            this.prepareFooters(dataTemplates);

            super.removeChild(dataTemplate);
        }
    }

    private prepareHeaders(dataTemplates: Array<DataTemplate>): void
    {
        const headerGroup = new DataHeaderGroup();
        for (const dataTemplate of dataTemplates)
        {
            const cell = new DataCell();
            cell.value = dataTemplate.header;

            const content = document.createElement("div");
            content.id    = "content";

            content.innerHTML = `<span>{{host.value}}</span>`;

            cell.setContent(content);

            super.contextBind({ host: cell }, content);

            headerGroup.appendChild(cell);
        }
        super.appendChild(headerGroup);
    }

    private prepareRows(dataTemplates: Array<DataTemplate>): void
    {
        const rowGroup = new DataRowGroup();

        for (const data of this.datasource)
        {
            const row = new DataRow();
            for (const dataTemplate of dataTemplates)
            {
                const cell = new DataCell();
                cell.value = data[dataTemplate.field];

                const content = document.createElement("div");
                content.id    = "content";

                if (dataTemplate.childNodes.length > 0)
                {
                    content.innerHTML = dataTemplate.innerHTML;

                    cell.appendChild(content);
                }
                else
                {
                    content.innerHTML = `<span>{{data['${dataTemplate.field}']}}</span>`;

                    cell.setContent(content);
                }

                super.contextBind({ host: cell, data }, content);

                row.appendChild(cell);
            }
            rowGroup.appendChild(row);
        }
        super.appendChild(rowGroup);
    }

    private prepareFooters(dataTemplates: Array<DataTemplate>): void
    {
        return;
    }
}