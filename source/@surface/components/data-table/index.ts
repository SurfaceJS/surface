import { Nullable }    from "@surface/core";
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
    private readonly dataTemplate: Nullable<HTMLTemplateElement>;

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

    public constructor()
    {
        super();

        this.dataTemplate = super.query<HTMLTemplateElement>("template");

        if (this.dataTemplate)
        {
            super.removeChild(this.dataTemplate);
        }
    }

    private applyDataBind()
    {
        if (this.dataTemplate)
        {
            const dataTemplates = Array.from(this.dataTemplate.content.querySelectorAll("data-template"));

            const headerFilter = (element: Element) => (element.parentElement && element.parentElement.tagName == "HEADER-TEMPLATE")
                || !!element.getAttribute(templateAttributes.header);

            const rowFilter = (element: Element) => !element.parentElement || element.parentElement!.tagName == "TEMPLATE-ROW";

            const footerFilter = (element: Element) => (element.parentElement && element.parentElement!.tagName == "FOOTER-TEMPLATE")
                || !!element.getAttribute(templateAttributes.agreggation);

            this.prepareHeaders(dataTemplates.filter(headerFilter));
            this.prepareRows(dataTemplates.filter(rowFilter));
            this.prepareFooters(dataTemplates.filter(footerFilter));
        }
    }

    private prepareHeaders(dataTemplates: Array<Element>): void
    {
        const headerGroup = new DataHeaderGroup();
        const row         = new DataRow();

        headerGroup.appendChild(row);
        for (const dataTemplate of dataTemplates)
        {
            const cell = new DataCell();

            const elementStyle = dataTemplate.getAttribute("style");

            if (elementStyle)
            {
                cell.setAttribute("style", elementStyle);
            }

            cell.text  = dataTemplate.getAttribute(templateAttributes.header) || dataTemplate.getAttribute(templateAttributes.field) || "";
            cell.value = cell.text;

            cell.innerHTML = `<span><b>{{this.value}}</b></span>`;

            CustomElement.contextBind({ this: cell }, cell);

            row.appendChild(cell);
        }
        super.appendChild(headerGroup);
    }

    private prepareRows(dataTemplates: Array<Element>): void
    {
        const rowGroup = new DataRowGroup();
        super.appendChild(rowGroup);

        for (const data of this.datasource)
        {
            const row = new DataRow();
            rowGroup.appendChild(row);

            for (const dataTemplate of dataTemplates)
            {
                const cell  = new DataCell();
                row.appendChild(cell);
                row.data = data;

                const elementStyle = dataTemplate.getAttribute("style");

                if (elementStyle)
                {
                    cell.setAttribute("style", elementStyle);
                }

                const field = dataTemplate.getAttribute(templateAttributes.field) || "";

                const value = field.indexOf(".") > -1 ? Expression.from(field, data).evaluate() : data[field];

                cell.text  = coalesce(value, "") as string;
                cell.value = value;

                let innerHTML = "";

                if (dataTemplate.childNodes.length > 0)
                {
                    innerHTML = dataTemplate.innerHTML;
                }
                else
                {
                    const edit    = dataTemplate.getAttribute("edit") == "true";
                    const $delete = dataTemplate.getAttribute("delete") == "true";

                    if (edit || $delete)
                    {
                        if (edit)
                        {
                            innerHTML = "<input type='button' value='edit' on-click='{{row.edit(true)}}' />";
                        }

                        if ($delete)
                        {
                            innerHTML = innerHTML + "<input type='button' value='delete'>";
                        }

                        innerHTML =
                        `
                            <surface-switch value="{{row.editMode}}">
                                <template when="true">
                                    <surface-stack-panel distribuition="center" orientation="horizontal">
                                        <input type='button' value='cancel' on-click='{{row.edit(false)}}' />
                                    </surface-stack-panel>
                                </template>
                                <template when="false">
                                    <surface-stack-panel distribuition="center" orientation="horizontal">
                                        ${innerHTML}
                                    </surface-stack-panel>
                                </template>
                            </surface-switch>
                        `;
                    }
                    else if (dataTemplate.getAttribute("editable") == "true")
                    {
                        innerHTML =
                        `
                            <surface-switch value="{{row.editMode}}">
                                <template when="true">
                                    <input type='text' value="{{row.data.${field}}}" style="width: 100%;" />
                                </template>
                                <template when="false">
                                    <span>{{row.data.${field}}}</span>
                                </template>
                            </surface-switch>
                        `;
                    }
                    else
                    {
                        innerHTML = `<span>{{row.data.${field}}}</span>`;
                    }
                }

                cell.innerHTML = innerHTML;

                CustomElement.contextBind({ ...super.context, table: this, row }, cell);
            }
        }
    }

    private prepareFooters(dataTemplates: Array<Element>): void
    {
        const footerGroup = new DataFooterGroup();

        const row = new DataRow();
        footerGroup.appendChild(row);
        for (const dataTemplate of dataTemplates)
        {
            const cell = new DataCell();

            const elementStyle = dataTemplate.getAttribute("style");

            if (elementStyle)
            {
                cell.setAttribute("style", elementStyle);
            }

            cell.text  = dataTemplate.getAttribute(templateAttributes.agreggation) || dataTemplate.getAttribute(templateAttributes.field) || "";
            cell.value = cell.text;

            cell.innerHTML = dataTemplate.childNodes.length > 0 ? dataTemplate.innerHTML : "";

            row.appendChild(cell);

            CustomElement.contextBind({ ...super.context }, cell);
        }
        super.appendChild(footerGroup);
    }
}