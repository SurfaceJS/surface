import { coalesce }    from "@surface/core/common/generic";
import Observer        from "@surface/core/observer";
import CustomElement   from "@surface/custom-element";
import Enumerable      from "@surface/enumerable";
import Expression      from "@surface/expression";
import DataCell        from "../data-cell";
import DataFooterGroup from "../data-footer-group";
import DataHeaderGroup from "../data-header-group";
import DataRow         from "../data-row";
import DataRowGroup    from "../data-row-group";
import { element }     from "../decorators";
import template        from "./index.html";
import style           from "./index.scss";
import DataTemplate    from "./internal/data-template";

@element("surface-data-table", template, style)
export default class DataTable extends CustomElement
{
    private readonly dataTemplates: Enumerable<DataTemplate> = Enumerable.empty();

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

        const dataTemplate = super.query<HTMLTemplateElement>("template");

        if (dataTemplate)
        {
            this.dataTemplates = Enumerable.from(Array.from(dataTemplate.content.querySelectorAll("data-template")))
                .select(x => new DataTemplate(x));

            super.removeChild(dataTemplate);
        }
    }

    private applyDataBind()
    {
        if (this.dataTemplates.any())
        {
            this.prepareRows();
        }
    }

    private prepareRows(): void
    {
        if (this.dataTemplates.where(x => !!x.header))
        {
            const headerGroup = new DataHeaderGroup();
            super.appendChild(headerGroup);

            const row = new DataRow();
            headerGroup.appendChild(row);

            for (const header of this.dataTemplates)
            {
                const cell = new DataCell();
                row.appendChild(cell);
                cell.innerHTML = `<span horizontal-align='center'><b>${header.header}</b></span>`;
            }
        }

        const rowGroup = new DataRowGroup();
        super.appendChild(rowGroup);

        for (const data of this.datasource)
        {
            const row = new DataRow();
            rowGroup.appendChild(row);

            for (const dataTemplate of this.dataTemplates)
            {
                console.dir(dataTemplate);
                const cell  = new DataCell();
                row.appendChild(cell);
                row.data = data;

                const elementStyle = dataTemplate.style;

                if (elementStyle)
                {
                    cell.setAttribute("style", elementStyle);
                }

                const field = dataTemplate.field;

                const value = field.indexOf(".") > -1 ? Expression.from(field, data).evaluate() : data[field];

                cell.text  = coalesce(value, "") as string;
                cell.value = value;

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
                    else if (dataTemplate.editable)
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
}