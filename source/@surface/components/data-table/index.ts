import { Nullable }                  from "@surface/core";
import { coalesce }                  from "@surface/core/common/generic";
import { proxyFactory, ProxyObject } from "@surface/core/common/object";
import { runAsync }                  from "@surface/core/common/promise";
import Observer                      from "@surface/core/observer";
import CustomElement                 from "@surface/custom-element";
import Enumerable                    from "@surface/enumerable";
import Expression                    from "@surface/expression";
import Component                     from "..";
import { element }                   from "../decorators";
import DataCell                      from "./data-cell";
import DataFooter                    from "./data-footer";
import DataHeader                    from "./data-header";
import DataRow                       from "./data-row";
import DataRowGroup                  from "./data-row-group";
import template                      from "./index.html";
import style                         from "./index.scss";
import IDataProvider                 from "./interfaces/data-provider";
import ColumnDefinition              from "./internal/column-definition";
import DataProvider                  from "./internal/data-provider";
import booleanTemplate               from "./templates/boolean.html";
import numberTemplate                from "./templates/number.html";
import stringTemplate                from "./templates/string.html";

@element("surface-data-table", template, style)
export default class DataTable extends Component
{
    private dataProvider: IDataProvider<object>;
    private readonly columnDefinitions: Enumerable<ColumnDefinition> = Enumerable.empty();

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

    public set datasource(value: Iterable<object>)
    {
        this.dataProvider = new DataProvider(value, this.pageSize);
    }

    private readonly _onDatasourceChange: Observer = new Observer();
    public get onDatasourceChange(): Observer
    {
        return this._onDatasourceChange;
    }

    public get pageSize(): number
    {
        return Number.parseInt(super.getAttribute("page-size") || "10");
    }

    public set pageSize(value: number)
    {
        super.setAttribute("page-size", value.toString());
    }

    public constructor()
    {
        super();

        const dataTemplate = super.query<HTMLTemplateElement>("template");

        if (dataTemplate)
        {
            this.columnDefinitions = Enumerable.from(Array.from(dataTemplate.content.querySelectorAll("column-definition")))
                .select(x => new ColumnDefinition(x));

            super.removeChild(dataTemplate);
        }

        const dataProvider = super.queryAll("*").firstOrDefault(x => x.tagName.endsWith("data-provider")) as Nullable<IDataProvider<object>>;

        this.dataProvider = dataProvider || new DataProvider([], this.pageSize);

        super.onAfterBind = () => runAsync(() => this.applyDataBind());
    }

    private applyDataBind(): void
    {
        const datasource = this.createProxy(Array.from(this.dataProvider));
        if (this.columnDefinitions.any())
        {
            this.prepareHeaders();
            this.prepareRows(datasource);
            this.prepareFooters();
        }
    }

    private createProxy(datasource: Iterable<object>): Iterable<ProxyObject<object>>
    {
        const sequence = Enumerable.from(datasource);

        if (sequence.any())
        {
            const proxy = proxyFactory(sequence.first());

            return sequence.select(x => new proxy(x));
        }

        return [];
    }

    private prepareFooters(): void
    {
        if (this.columnDefinitions.any(x => !!x.footer))
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

            for (const columnDefinition of this.columnDefinitions)
            {
                const cell = new DataCell();
                row.appendChild(cell);

                if (columnDefinition.style)
                {
                    cell.setAttribute("style", columnDefinition.style);
                }

                cell.innerHTML = `<span horizontal-align='center'><b>${columnDefinition.header}</b></span>`;
            }
        }
    }

    private prepareHeaders(): void
    {
        if (this.columnDefinitions.any(x => !!x.header))
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

            for (const columnDefinition of this.columnDefinitions)
            {
                const cell = new DataCell();
                row.appendChild(cell);

                if (columnDefinition.style)
                {
                    cell.setAttribute("style", columnDefinition.style);
                }

                cell.innerHTML = `<span horizontal-align='center'><b>${columnDefinition.header}</b></span>`;
            }
        }
    }

    private prepareRows(datasource: Iterable<ProxyObject<object>>): void
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

        for (const item of datasource)
        {
            const row = new DataRow(item);
            rowGroup.appendChild(row);

            let index = 0;
            for (const columnDefinition of this.columnDefinitions)
            {
                const field = columnDefinition.field;
                const value = field.indexOf(".") > -1 ? Expression.from(field, item).evaluate() : item[field];

                const cell = new DataCell(columnDefinition.editable, index, coalesce(value, ""), value);
                row.appendChild(cell);

                if (columnDefinition.style)
                {
                    cell.setAttribute("style", columnDefinition.style);
                }

                let innerHTML = "";

                if (columnDefinition.template)
                {
                    innerHTML = columnDefinition.template.innerHTML;
                }
                else
                {
                    if (columnDefinition.editButtom || columnDefinition.deleteButtom)
                    {
                        if (columnDefinition.editButtom)
                        {
                            innerHTML = "<input type='button' value='edit' on-click='{{row.edit(true)}}' />";
                        }

                        if (columnDefinition.deleteButtom)
                        {
                            innerHTML = innerHTML + "<input type='button' value='delete'>";
                        }

                        innerHTML =
                        `
                            <surface-switch value="{{row.editMode}}">
                                <template when="true">
                                    <input type='button' value='save'   horizontal-align="center" on-click='{{row.save()}}' />
                                    <input type='button' value='cancel' horizontal-align="center" on-click='{{row.cancel()}}' />
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