import { Nullable as __Nullable__, ObjectLiteral } from "@surface/core";
import { coalesce }                                from "@surface/core/common/generic";
import { clone, objectFactory }                    from "@surface/core/common/object";
import { runAsync }                                from "@surface/core/common/promise";
import CustomElement                               from "@surface/custom-element";
import Enumerable                                  from "@surface/enumerable";
import Observer                                    from "@surface/observer";
import Component                                   from "..";
import { element }                                 from "../decorators";
import DataCell                                    from "./data-cell";
import DataFooter                                  from "./data-footer";
import DataHeader                                  from "./data-header";
import DataRow                                     from "./data-row";
import DataRowGroup                                from "./data-row-group";
import template                                    from "./index.html";
import style                                       from "./index.scss";
import IDataProvider                               from "./interfaces/data-provider";
import ColumnDefinition                            from "./internal/column-definition";
import DataProvider                                from "./internal/data-provider";
import arrayTemplate                               from "./templates/array.html";
import booleanTemplate                             from "./templates/boolean.html";
import numberTemplate                              from "./templates/number.html";
import stringTemplate                              from "./templates/string.html";

type Nullable<T> = __Nullable__<T>;

@element("surface-data-table", template, style)
export default class DataTable extends Component
{
    private readonly columnDefinitions: Enumerable<ColumnDefinition> = Enumerable.empty();

    private rowGroup!: DataRowGroup;

    private readonly _onDatasourceChange: Observer = new Observer();

    private _datasource:     Iterable<object> = [];
    private _dataDefinition: object = { };

    protected dataProvider: IDataProvider<object>;

    protected get pageCount(): number
    {
        return this.dataProvider.pageCount;
    }

    public get dataDefinition(): object
    {
        return this._dataDefinition;
    }

    public set dataDefinition(value: object)
    {
        this._dataDefinition = value;
    }

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
        if (value != this._datasource)
        {
            this._datasource = value;
            this.dataProvider = new DataProvider(value, this.pageSize);

            const observer = Observer.observe(this.dataProvider, "pageCount");

            observer.subscribe(() => Observer.notify(this, "pageCount" as keyof this));

            runAsync(this.refresh.bind(this)).then(() => this.onDatasourceChange.notify());
        }
    }

    public get infinityScroll(): boolean
    {
        return this.getAttribute("infinity-scroll") == "true";
    }

    public set infinityScroll(value: boolean)
    {
        this.setAttribute("infinity-scroll", value.toString());
    }

    public get onDatasourceChange(): Observer
    {
        return this._onDatasourceChange;
    }

    public get pageSize(): number
    {
        return Number.parseInt(super.getAttribute("page-size") || "10") || 10;
    }

    public set pageSize(value: number)
    {
        super.setAttribute("page-size", value.toString());
    }

    public constructor(dataProvider?: Nullable<IDataProvider<object>>)
    {
        super();

        if (!dataProvider)
        {
            dataProvider = super.queryAll("*").firstOrDefault(x => x.tagName.toLowerCase().endsWith("data-provider")) as Nullable<IDataProvider<object>>;

            if (dataProvider instanceof HTMLElement)
            {
                const clone = dataProvider.cloneNode() as HTMLElement & IDataProvider<object>;

                super.replaceChild(clone, dataProvider);

                this.dataProvider = clone as IDataProvider<object>;
            }
            else
            {
                this.dataProvider = new DataProvider([], this.pageSize);
            }
        }
        else
        {
            this.dataProvider = dataProvider;
        }

        const observer = Observer.observe(this.dataProvider, "pageCount");

        observer.subscribe(() => Observer.notify(this, "pageCount" as keyof this));

        const dataTemplate = super.query<HTMLTemplateElement>("template");

        if (dataTemplate)
        {
            this.columnDefinitions = Enumerable.from(Array.from(dataTemplate.content.querySelectorAll("column-definition")))
                .select(x => new ColumnDefinition(x));

            super.removeChild(dataTemplate);
        }

        const primitives =
        {
            "array":   [],
            "boolean": false,
            "number":  0,
            "string":  "",
        };

        this.dataDefinition = objectFactory(this.columnDefinitions.select(x => [x.field, primitives[x.fieldType]] as [string, unknown]).toArray());

        this.prepareHeaders();
        this.prepareRows();
        this.prepareFooters();
    }

    private createData(): object
    {
        return clone(this.dataDefinition);
    }

    private createRow(data: ObjectLiteral, isNew: boolean): DataRow
    {
        const row = new DataRow(isNew, data);

        let index = 0;

        for (const columnDefinition of this.columnDefinitions)
        {
            const field = columnDefinition.field;
            const value = (field.indexOf(".") > -1 ? Function("data", `data.${field}`)(data) : data[field]) as Nullable<string>;

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
                        case "array":
                            innerHTML = (arrayTemplate as string).replace(/\$\{(field)\}/g, field);
                            break;
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

            const order = { true: "asc", false: "desc" };

            for (const columnDefinition of this.columnDefinitions)
            {
                const cell = new DataCell();
                row.appendChild(cell);

                let asc = false;

                cell.addEventListener("click", () => this.order(columnDefinition.field, order[(asc = !asc).toString() as "true"|"false"] as "asc"|"desc"));

                if (columnDefinition.style)
                {
                    cell.setAttribute("style", columnDefinition.style);
                }

                cell.innerHTML = `<span horizontal-align='center'><b>${columnDefinition.header}</b></span>`;
            }
        }
    }

    private prepareRows(): void
    {
        if (!this.rowGroup)
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
        }
    }

    private async updateRows(): Promise<void>
    {
        const datasource = Enumerable.from(await this.dataProvider.read());

        const rows = this.rowGroup.queryAll<DataRow>("surface-data-row");

        const dataCount = datasource.count();
        const rowsCount = rows.count();

        if (rowsCount > dataCount)
        {
            rows.skip(dataCount).forEach(x => this.rowGroup.removeChild(x));
        }
        else if (rowsCount < dataCount)
        {
            datasource.skip(rowsCount).forEach(x => this.rowGroup.appendChild(this.createRow(x, false)));
        }

        rows.zip(datasource, (row, data) => ({ row, data }))
            .forEach(x => x.row.data = x.data);
    }

    public addNew(): void
    {
        const data = this.createData();
        const row  = this.createRow(data, true);
        this.rowGroup.appendChild(row);
    }

    public addRow(row: DataRow): void
    {
        this.dataProvider.create(row.data);
        this.rowGroup.appendChild(row);
    }

    public connectedCallback(): void
    {
        this.refresh();
    }

    public deleteRow(row: DataRow): void
    {
        this.dataProvider.delete(row.data);
        this.rowGroup.removeChild(row);
        if (this.dataProvider.total >= this.pageSize && this.rowGroup.childNodes.length < this.pageSize)
        {
            this.refresh();
        }
    }

    public async firstPage(): Promise<void>
    {
        this.dataProvider.firstPage();
        await this.refresh();
    }

    public async lastPage(): Promise<void>
    {
        this.dataProvider.lastPage();
        await this.refresh();
    }

    public async nextPage(): Promise<void>
    {
        this.dataProvider.nextPage();
        await this.refresh();
    }

    public order(field: string, direction: "asc" | "desc"): void
    {
        this.dataProvider.order = { field, direction };
        this.refresh();
    }

    public async previousPage(): Promise<void>
    {
        this.dataProvider.previousPage();
        await this.refresh();
    }

    public async refresh(): Promise<void>
    {
        await this.updateRows();
    }

    public saveRow(row: DataRow): void
    {
        row.save();
        row.isNew    = false;
        row.editMode = false;

        if (row.isNew)
        {
            this.dataProvider.create(row.data);
            if (this.rowGroup.childNodes.length > this.pageSize)
            {
                this.refresh();
            }
        }
    }

    public async setPage(page: number): Promise<void>
    {
        if (page != this.dataProvider.page)
        {
            this.dataProvider.page = page;
            await this.refresh();
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
            row.undo();
        }

        row.editMode = false;
    }
}