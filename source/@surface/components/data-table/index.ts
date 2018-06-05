import { Unknown }     from "@surface/core";
import { coalesce }    from "@surface/core/common/generic";
import Observer        from "@surface/core/observer";
import CustomElement   from "@surface/custom-element";
import { element }     from "@surface/custom-element/decorators";
import Enumerable      from "@surface/enumerable";
import Expression      from "@surface/expression";
import DataCell        from "../data-cell";
import DataFooterGroup from "../data-footer-group";
import DataHeaderGroup from "../data-header-group";
import DataRow         from "../data-row";
import DataRowGroup    from "../data-row-group";
//import DataTemplate    from "../data-template";
import template        from "./index.html";
import style           from "./index.scss";

const templateAttributes =
{
    field:       "field",
    header:      "header",
    agreggation: "agreggation",
    type:        "type"
};

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

    private _host: Unknown;
    public get host(): Unknown
    {
        return this._host;
    }

    public set host(value: Unknown)
    {
        this._host = value;
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
        if (value && !Object.is(value, this._datasource))
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

            const dataTemplates = Array.from(content.querySelectorAll("data-template"));

            const headerFilter = (element: Element) => (element.parentElement && element.parentElement.tagName == "HEADER-TEMPLATE")
                || !!element.getAttribute(templateAttributes.header);

            const rowFilter = (element: Element) => !element.parentElement || element.parentElement!.tagName == "TEMPLATE-ROW";

            const footerFilter = (element: Element) => (element.parentElement && element.parentElement!.tagName == "FOOTER-TEMPLATE")
                || !!element.getAttribute(templateAttributes.agreggation);

            this.prepareHeaders(dataTemplates.filter(headerFilter));
            this.prepareRows(dataTemplates.filter(rowFilter));
            this.prepareFooters(dataTemplates.filter(footerFilter));

            super.removeChild(dataTemplate);
        }
    }

    private prepareHeaders(dataTemplates: Array<Element>): void
    {
        const headerGroup = new DataHeaderGroup();
        for (const dataTemplate of dataTemplates)
        {
            const cell = new DataCell();
            cell.text  = dataTemplate.getAttribute(templateAttributes.header) || dataTemplate.getAttribute(templateAttributes.field) || "";
            cell.value = cell.text;

            const content = document.createElement("div");
            content.id    = "content";

            content.innerHTML = `<span>{{this.value}}</span>`;

            cell.appendChild(content);

            super.contextBind({ this: cell }, content);

            headerGroup.appendChild(cell);
        }
        super.appendChild(headerGroup);
    }

    private prepareRows(dataTemplates: Array<Element>): void
    {
        const rowGroup = new DataRowGroup();

        for (const data of this.datasource)
        {
            const row = new DataRow();
            for (const dataTemplate of dataTemplates)
            {
                const cell  = new DataCell();
                const field = dataTemplate.getAttribute(templateAttributes.field) || "";

                const value = field.indexOf(".") > -1 ? Expression.from(field, data).evaluate() : data[field];

                cell.text  = coalesce(value, "") as string;
                cell.value = value;

                const content = document.createElement("div");

                content.id        = "content";
                content.innerHTML = dataTemplate.childNodes.length > 0 ? dataTemplate.innerHTML : `<span>{{data.${field}}}</span>`;

                cell.appendChild(content);
                row.appendChild(cell);

                super.contextBind({ host: this.host, data }, content);
            }
            rowGroup.appendChild(row);
        }
        super.appendChild(rowGroup);
    }

    private prepareFooters(dataTemplates: Array<Element>): void
    {
        const footerGroup = new DataFooterGroup();
        for (const dataTemplate of dataTemplates)
        {
            const cell = new DataCell();
            cell.text  = dataTemplate.getAttribute(templateAttributes.agreggation) || dataTemplate.getAttribute(templateAttributes.field) || "";
            cell.value = cell.text;

            const content = document.createElement("div");
            content.id    = "content";

            content.innerHTML = dataTemplate.childNodes.length > 0 ? dataTemplate.innerHTML : "";

            cell.setContent(content);
            footerGroup.appendChild(cell);

            super.contextBind({ host: this.host }, content);
        }
        super.appendChild(footerGroup);
    }
}