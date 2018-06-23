import { coalesce }    from "@surface/core/common/generic";
import Observer        from "@surface/core/observer";
import CustomElement   from "@surface/custom-element";
import Enumerable      from "@surface/enumerable";
import Expression      from "@surface/expression";
import { runAsync }    from "../../core/common/promise";
import { element }     from "../decorators";
import DataCell        from "./data-cell";
import DataFooter      from "./data-footer";
import DataHeader      from "./data-header";
import DataRow         from "./data-row";
import DataRowGroup    from "./data-row-group";
import template        from "./index.html";
import style           from "./index.scss";
import DataTemplate    from "./internal/data-template";
import booleanTemplate from "./templates/boolean.html";
import numberTemplate  from "./templates/number.html";
import stringTemplate  from "./templates/string.html";

@element("surface-data-table", template, style)
export default class DataTable extends CustomElement
{
    private readonly dataTemplates: Enumerable<DataTemplate> = Enumerable.empty();

    public get dataFooterGroups(): Enumerable<DataFooter>
    {
        return super.queryAll("surface-data-footer");
    }

    public get dataHeaderGroups(): Enumerable<DataHeader>
    {
        return super.queryAll("surface-data-header");
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
            runAsync(() => this.applyDataBind());
            this.onDatasourceChange.notify(value);
        }
    }

    public constructor()
    {
        super();

        const dataTemplate = super.query<HTMLTemplateElement>("template");

        if (dataTemplate)
        {
            this.dataTemplates = Enumerable.from(Array.from(dataTemplate.content.querySelectorAll("data-template")))
                .select(x => new DataTemplate(x));

            super.removeChild(dataTemplate);
        }
    }

    private applyDataBind(): void
    {
        if (this.dataTemplates.any())
        {
            this.prepareHeaders();
            this.prepareRows();
            this.prepareFooters();
        }
    }

    private prepareFooters(): void
    {
        if (this.dataTemplates.any(x => !!x.footer))
        {
            const footerGroup = new DataFooter();

            const footerElement = super.query("surface-data-table > surface-data-footer:last-of-type")
                || super.query("surface-data-table > surface-data-header:last-of-type");

            if (footerElement)
            {
                footerElement.insertAdjacentElement("afterend", footerGroup);
            }
            else
            {
                super.appendChild(footerGroup);
            }

            const row = new DataRow();
            footerGroup.appendChild(row);

            for (const header of this.dataTemplates)
            {
                const cell = new DataCell();
                row.appendChild(cell);

                if (header.style)
                {
                    cell.setAttribute("style", header.style);
                }

                cell.innerHTML = `<span horizontal-align='center'><b>${header.header}</b></span>`;
            }
        }
    }

    private prepareHeaders(): void
    {
        if (this.dataTemplates.any(x => !!x.header))
        {
            const headerGroup = new DataHeader();

            const headerElement = super.query("surface-data-table > surface-data-header:last-of-type");

            if (headerElement)
            {
                headerElement.insertAdjacentElement("afterend", headerGroup);
            }
            else
            {
                super.appendChild(headerGroup);
            }

            const row = new DataRow();
            headerGroup.appendChild(row);

            for (const header of this.dataTemplates)
            {
                const cell = new DataCell();
                row.appendChild(cell);

                if (header.style)
                {
                    cell.setAttribute("style", header.style);
                }

                cell.innerHTML = `<span horizontal-align='center'><b>${header.header}</b></span>`;
            }
        }
    }

    private prepareRows(): void
    {
        const rowGroup = new DataRowGroup();

        const headerElement = super.query("surface-data-table > surface-data-row-group:last-of-type")
            || super.query("surface-data-table > surface-data-header:last-of-type");

        if (headerElement)
        {
            headerElement.insertAdjacentElement("afterend", rowGroup);
        }
        else
        {
            super.appendChild(rowGroup);
        }

        for (const data of this.datasource)
        {
            const row = new DataRow(data);
            rowGroup.appendChild(row);

            let index = 0;
            for (const dataTemplate of this.dataTemplates)
            {
                const field = dataTemplate.field;
                const value = field.indexOf(".") > -1 ? Expression.from(field, data).evaluate() : data[field];

                const cell = new DataCell(dataTemplate.editable, index, coalesce(value, ""), value);
                row.appendChild(cell);

                if (dataTemplate.style)
                {
                    cell.setAttribute("style", dataTemplate.style);
                }

                let innerHTML = "";

                if (dataTemplate.template)
                {
                    innerHTML = dataTemplate.template.innerHTML;
                }
                else
                {
                    if (dataTemplate.edit || dataTemplate.delete)
                    {
                        if (dataTemplate.edit)
                        {
                            innerHTML = "<input type='button' value='edit' on-click='{{row.edit(true)}}' />";
                        }

                        if (dataTemplate.delete)
                        {
                            innerHTML = innerHTML + "<input type='button' value='delete'>";
                        }

                        innerHTML =
                        `
                            <surface-switch value="{{row.editMode}}">
                                <template when="true">
                                    <input type='button' value='cancel' horizontal-align="center" on-click='{{row.edit(false)}}' />
                                </template>
                                <template when="false">
                                    <surface-stack-panel distribuition="center" orientation="horizontal">
                                        ${innerHTML}
                                    </surface-stack-panel>
                                </template>
                            </surface-switch>
                        `;
                    }
                    else
                    {
                        switch (typeof value)
                        {
                            case "boolean":
                                innerHTML = (booleanTemplate as string).replace(/\$\{(field)\}/g, field);
                                break;
                            case "number":
                                innerHTML = (numberTemplate as string).replace(/\$\{(field)\}/g, field);
                                break;
                            case "string":
                            default:
                                innerHTML = (stringTemplate as string).replace(/\$\{(field)\}/g, field);
                                break;
                        }
                    }
                }

                cell.innerHTML = innerHTML;

                CustomElement.contextBind({ ...super.context, table: this, row, cell }, cell);

                index++;
            }
        }
    }
}