import { Constructor, Nullable, Unknown }                  from "@surface/core";
import { coalesce }                                        from "@surface/core/common/generic";
import { clone, objectFactory, proxyFactory, ProxyObject } from "@surface/core/common/object";
import { runAsync }                                        from "@surface/core/common/promise";
import Observer                                            from "@surface/core/observer";
import CustomElement                                       from "@surface/custom-element";
import Enumerable                                          from "@surface/enumerable";
import Expression                                          from "@surface/expression";
import Component                                           from "..";
import { element }                                         from "../decorators";
import DataCell                                            from "./data-cell";
import DataFooter                                          from "./data-footer";
import DataHeader                                          from "./data-header";
import DataRow                                             from "./data-row";
import DataRowGroup                                        from "./data-row-group";
import template                                            from "./index.html";
import style                                               from "./index.scss";
import IDataProvider                                       from "./interfaces/data-provider";
import ColumnDefinition                                    from "./internal/column-definition";
import DataProvider                                        from "./internal/data-provider";
import booleanTemplate                                     from "./templates/boolean.html";
import numberTemplate                                      from "./templates/number.html";
import stringTemplate                                      from "./templates/string.html";

@element("surface-data-table", template, style)
export default class DataTable extends Component
{
    private readonly columnDefinitions: Enumerable<ColumnDefinition> = Enumerable.empty();

    private rowGroup!:         DataRowGroup;
    private proxyConstructor!: Constructor<ProxyObject<object>>;

    private _dataDefinition: object = { };
    public get dataDefinition(): object
    {
        return this._dataDefinition;
    }

    public set dataDefinition(value: object)
    {
        this._dataDefinition = value;
    }

    private dataProvider: IDataProvider<object>;

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
        runAsync(() => this.dataBind());
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

        this.prepareHeaders();
        this.prepareFooters();
    }

    private dataBind(): void
    {
        if (this.columnDefinitions.any())
        {
            this.checkDefinitions();

            const datasource = Enumerable.from(this.dataProvider).select(x => new this.proxyConstructor(x));
            this.prepareRows(datasource);
        }
    }

    private checkDefinitions(): void
    {
        if (!this.proxyConstructor)
        {
            const primitives =
            {
                "string":  "",
                "boolean": false,
                "number":  0,
            };

            this.dataDefinition = objectFactory(this.columnDefinitions.select(x => [x.field, primitives[x.fieldType]] as [string, Unknown]).toArray());

            this.proxyConstructor = proxyFactory(this.dataDefinition);
        }
    }

    private createData(): ProxyObject<object>
    {
        this.checkDefinitions();

        return new this.proxyConstructor(clone(this.dataDefinition));
    }

    private createRow(data: ProxyObject<object>, isNew: boolean): DataRow
    {
        const row = new DataRow(isNew, data);
        let index = 0;
        for (const columnDefinition of this.columnDefinitions)
        {
            const field = columnDefinition.field;
            const value = field.indexOf(".") > -1 ? Expression.from(field, data).evaluate() : data[field];

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
                        innerHTML = "<input type='button' value='edit' on-click='{{row.enterEdit()}}' />";
                    }

                    if (columnDefinition.deleteButtom)
                    {
                        innerHTML = innerHTML + "<input type='button' value='delete' on-click='{{dataTable.deleteRow(row)}}' />";
                    }

                    innerHTML =
                    `
                        <surface-switch value="{{row.editMode}}">
                            <template when="true">
                                <input type='button' value='save'   horizontal-align="center" on-click='{{dataTable.saveRow(row)}}' />
                                <input type='button' value='cancel' horizontal-align="center" on-click='{{dataTable.undoRow(row)}}' />
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
                    switch (columnDefinition.fieldType)
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

            CustomElement.contextBind({ ...super.context, dataTable: this, row, cell }, cell);

            index++;
        }

        return row;
    }

    private prepareFooters(): void
    {
        if (this.columnDefinitions.any(x => !!x.footer))
        {
            const footerGroup = new DataFooter();

            const simbling = super.query("surface-data-table > surface-data-footer:last-of-type")
                || super.query("surface-data-table > surface-data-header:last-of-type");

            if (simbling)
            {
                simbling.insertAdjacentElement("afterend", footerGroup);
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

            const simbling = super.query("surface-data-table > surface-data-header:last-of-type");

            if (simbling)
            {
                simbling.insertAdjacentElement("afterend", headerGroup);
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
        this.rowGroup = rowGroup;

        const simbling = super.query("surface-data-table > surface-data-row-group:last-of-type")
            || super.query("surface-data-table > surface-data-header:last-of-type");

        if (simbling)
        {
            simbling.insertAdjacentElement("afterend", rowGroup);
        }
        else
        {
            super.appendChild(rowGroup);
        }

        for (const item of datasource)
        {
            const row = this.createRow(item, false);
            rowGroup.appendChild(row);
        }
    }

    public addNew(): void
    {
        const data = this.createData();
        const row  = this.createRow(data, true);
        this.rowGroup.appendChild(row);
    }

    public addRow(row: DataRow): void
    {
        this.dataProvider.add(row.data.source);
        this.rowGroup.appendChild(row);
    }

    public deleteRow(row: DataRow): void
    {
        this.dataProvider.remove(row.data.source);
        this.rowGroup.removeChild(row);
        if (this.dataProvider.total >= this.pageSize && this.rowGroup.childNodes.length < this.pageSize)
        {
            this.rowGroup.innerHTML = "";
            this.dataBind();
        }
    }

    public saveRow(row: DataRow): void
    {
        row.data.save();
        row.isNew    = false;
        row.editMode = false;

        if (row.isNew)
        {
            this.dataProvider.add(row.data.source);
            if (this.rowGroup.childNodes.length > this.pageSize)
            {
                this.rowGroup.innerHTML = "";
                this.dataBind();
            }
        }
    }

    public undoRow(row: DataRow): void
    {
        if (row.isNew)
        {
            this.deleteRow(row);
        }
        else
        {
            row.data.undo();
        }

        row.editMode = false;
    }
}