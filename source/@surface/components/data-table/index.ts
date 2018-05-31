import Observer      from "@surface/core/observer";
import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import Enumerable    from "@surface/enumerable";
import DataCell      from "../data-cell";
import DataHeader    from "../data-header";
import DataRow       from "../data-row";
import DataTemplate  from "../data-template";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-data-table", template, style)
export default class DataTable extends CustomElement
{
    public get dataHeaders(): Enumerable<DataHeader>
    {
        return super.queryAll("surface-data-header");
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
            this.onDatasourceChange.notify();
        }
    }

    private applyDataBind()
    {
        const dataTemplates = super.queryAll<DataTemplate>("surface-data-template");

        for (const data of this.datasource)
        {
            const row = new DataRow();
            for (const dataTemplate of dataTemplates)
            {
                const column = new DataCell();
                row.data = data;
                column.value = data[dataTemplate.field];

                const content = document.importNode(dataTemplate.template.content, true);

                column.appendChild(content);

                super.applyBind(row, column);

                row.appendChild(column);
            }
            super.appendChild(row);
        }

        dataTemplates.forEach(x => super.removeChild(x));
    }

    /*
    private applyDataBind2()
    {
        const headers = this.dataHeaders;

        if (headers.all(x => !(x.parentElement instanceof DataRow)))
        {
            const row = new DataRow();
            headers.forEach(x => row.appendChild(x));
            super.appendChild(row);
        }

        for (const data of this.datasource)
        {
            const row = new DataRow();
            for (const header of headers)
            {
                const column = new DataCell();
                column.value = data[header.field];
                row.appendChild(column);
            }
            super.appendChild(row);
        }
    }
    */
}