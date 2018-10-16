import { Func1, KeyValue, Nullable as __Nullable__, ObjectLiteral } from "@surface/core";
import { coalesce }                                                 from "@surface/core/common/generic";
import { clone, objectFactory }                                     from "@surface/core/common/object";
import CustomElement                                                from "@surface/custom-element";
import Enumerable                                                   from "@surface/enumerable";
import Observer                                                     from "@surface/observer";
import Component                                                    from "..";
import { attribute, element }                                       from "../decorators";
import Modal                                                        from "../modal";
import DataCell                                                     from "./data-cell";
import DataFilter                                                   from "./data-filter";
import DataFooter                                                   from "./data-footer";
import DataHeader                                                   from "./data-header";
import DataRow                                                      from "./data-row";
import DataRowGroup                                                 from "./data-row-group";
import template                                                     from "./index.html";
import style                                                        from "./index.scss";
import IDataProvider                                                from "./interfaces/data-provider";
import ColumnDefinition                                             from "./internal/column-definition";
import DataProvider                                                 from "./internal/data-provider";
import arrayTemplate                                                from "./templates/array.html";
import booleanTemplate                                              from "./templates/boolean.html";
import numberTemplate                                               from "./templates/number.html";
import stringTemplate                                               from "./templates/string.html";

type Nullable<T> = __Nullable__<T>;

@element("surface-data-table", template, style)
export default class DataTable extends Component
{
    private readonly _onDatasourceChange: Observer = new Observer();

    private _datasource:     Array<object> = [];
    private _dataDefinition: object        = { };
    private _editing:        boolean       = false;
    private _infinityScroll: boolean       = false;
    private _page:           number        = 1;
    private _pageCount:      number        = 0;
    private _pageSize:       number        = 10;

    private attributeParse: ObjectLiteral<Func1<string, KeyValue<DataTable, "pageSize"|"infinityScroll">>> =
    {
        "page-size":       (value: string) => ["pageSize",       Number.parseInt(value) || 0],
        "infinity-scroll": (value: string) => ["infinityScroll", value == "true"]
    };

    private readonly columnDefinitions: Enumerable<ColumnDefinition> = Enumerable.empty();

    private rowGroup!: DataRowGroup;

    protected dataProvider: IDataProvider;

    protected get editing(): boolean
    {
        return this._editing;
    }

    public get page(): number
    {
        return this._page;
    }

    public set page(value: number)
    {
        this._page = value;
        this.setPage(value);
    }

    protected get pageCount(): number
    {
        return this._pageCount;
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

    public get datasource(): Array<object>
    {
        return this._datasource;
    }

    public set datasource(value: Array<object>)
    {
        if (value != this._datasource)
        {
            this._datasource  = value;
            this.dataProvider = new DataProvider(value, this.pageSize);

            const observer = Observer.observe(this.dataProvider, "pageCount");

            observer.subscribe(value => this._pageCount = value as number);

            this.refresh().then(() => this.onDatasourceChange.notify());
        }
    }

    @attribute
    public get infinityScroll(): boolean
    {
        return this._infinityScroll;
    }

    public set infinityScroll(value: boolean)
    {
        this._infinityScroll = value;
    }

    public get onDatasourceChange(): Observer
    {
        return this._onDatasourceChange;
    }

    @attribute
    public get pageSize(): number
    {
        return this._pageSize;
    }

    public set pageSize(value: number)
    {
        this._pageSize = value;
    }

    public constructor(dataProvider?: Nullable<IDataProvider>)
    {
        super();

        if (!dataProvider)
        {
            dataProvider = super.queryAll("*").firstOrDefault(x => x.tagName.toLowerCase().endsWith("data-provider")) as Nullable<IDataProvider>;

            if (dataProvider instanceof HTMLElement)
            {
                const clone = dataProvider.cloneNode() as HTMLElement & IDataProvider;

                super.replaceChild(clone, dataProvider);

                this.dataProvider = clone as IDataProvider;
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

        observer.subscribe(value => this._pageCount = value as number);

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
        const row = new DataRow(isNew, clone(data));

        row.addEventListener("enter-edit", event => this.onRowChange((event as CustomEvent<DataRow>).detail, true));
        row.addEventListener("leave-edit", event => this.onRowChange((event as CustomEvent<DataRow>).detail, false));

        if(row.new)
        {
            row.enterEdit();
        }

        let index = 0;

        for (const columnDefinition of this.columnDefinitions)
        {
            const field = columnDefinition.field;
            const value = (field.indexOf(".") > -1 ? Function("data", `data.${field}`)(data) : data[field]) as Nullable<string>;

            const cell = new DataCell(columnDefinition.editable, columnDefinition.sortable, index, coalesce(value, ""), value);
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
                        innerHTML = /*html*/ `<input type="button" disabled="{{ row.disabled }}" value="edit" on-click="{{ row.enterEdit() }}" />`;
                    }

                    if (columnDefinition.deleteButtom)
                    {
                        innerHTML = innerHTML + /*html*/ `<input type="button" disabled="{{row.disabled}}" value="delete" on-click="{{ dataTable.deleteRow(row) }}" />`;
                    }

                    innerHTML = //html
                    `
                        <surface-switch value="{{ row.editMode }}">
                            <template when="true">
                                <input type="button" value="save"   horizontal-align="center" on-click="{{ dataTable.saveRow(row) }}" />
                                <input type="button" value="cancel" horizontal-align="center" on-click="{{ dataTable.undoRow(row) }}" />
                            </template>
                            <template when="false">
                                <surface-stack-panel content="center" orientation="horizontal">
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

    private onRowChange(row: DataRow, entering: boolean): void
    {
        const rows = Array.from(this.rowGroup.querySelectorAll("surface-data-row"));

        this._editing = entering;
        Enumerable.from(rows).cast<DataRow>().where(x => x != row).forEach(x => x.disabled = entering);
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

                cell.innerHTML = /*html*/ `<span horizontal-align="center"><b>${columnDefinition.header}</b></span>`;
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

            let index = 0;

            for (const columnDefinition of this.columnDefinitions)
            {
                const cell = new DataCell(false, columnDefinition.sortable, index);

                row.appendChild(cell);

                if (columnDefinition.style)
                {
                    cell.setAttribute("style", columnDefinition.style);
                }

                cell.innerHTML = //html
                `
                    <div on-click="{{ cell.sortable && table.sort(field, order[toogle()]) }}" style="width: 100%;">
                        <span horizontal-align="center"><b>${columnDefinition.header}</b></span>
                    </div>
                    ${
                        columnDefinition.filterable && !columnDefinition.editButtom && !columnDefinition.deleteButtom ?
                            /*html*/ `<input type="button" value="F" on-click="{{ showFilters }}" />`
                            : ""
                    }
                `;

                let showFilters = function(this: HTMLInputElement) { return; };

                if (columnDefinition.filterable)
                {
                    const modal = new Modal();
                    modal.startPosition = "manual";

                    const filter = new DataFilter(columnDefinition.field, columnDefinition.fieldType);

                    modal.appendChild(filter);

                    let showing = false;

                    showFilters = function(this: HTMLInputElement)
                    {
                        if (showing)
                        {
                            modal.hide();
                        }
                        else
                        {
                            const bounding = this.getBoundingClientRect();

                            modal.style.left      = `${bounding.left + bounding.width}px`;
                            modal.style.top       = `${bounding.top  + bounding.height}px`;
                            modal.horizontalAlign = Component.HorizontalAlign.Right;
                            modal.verticalAlign   = Component.VerticalAlign.Top;

                            modal.show();
                        }

                        showing = !showing;
                    };

                    filter.addEventListener("apply", () => { modal.hide(); showing = false; });
                }

                let asc = false;

                const toogle = () => asc = !asc;

                const context = { ...super.context, cell, field: columnDefinition.field, order, showFilters, table: this, toogle };

                CustomElement.contextBind(context, cell);

                index++;
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

    private async setPage(page: number): Promise<void>
    {
        if (page != this.dataProvider.page)
        {
            this.dataProvider.page = this.page;
            await this.refresh();
        }
    }

    protected attributeChangedCallback(name: "page-size"|"infinity-scroll", __: Nullable<string>, newValue: string)
    {
        const [key, value] = this.attributeParse[name](newValue);

        if (value != this[key])
        {
            this[key] = value;
        }
    }

    protected connectedCallback(): void
    {
        this.refresh();
    }

    public async addNew(): Promise<void>
    {
        if (this.dataProvider.pageCount > 0)
        {
            this._page = this.dataProvider.pageCount;
            this._editing = true;

            await this.setPage(this._page);

            Observer.notify(this, "page");
        }

        const data = this.createData();
        const row  = this.createRow(data, true);

        this.rowGroup.appendChild(row);
    }

    public async addRow(row: DataRow): Promise<void>
    {
        this.dataProvider.create(row.reference);
        await this.refresh();
    }

    public async deleteRow(row: DataRow): Promise<void>
    {
        this.dataProvider.delete(row.reference);
        await this.refresh();
    }

    public async sort(field: string, direction: "asc" | "desc"): Promise<void>
    {
        this.dataProvider.order = { field, direction };
        await this.refresh();
    }

    public async refresh(): Promise<void>
    {
        const datasource = Enumerable.from(await this.dataProvider.read());

        const rows = this.rowGroup.queryAll<DataRow>("surface-data-row");

        const dataCount = datasource.count();
        const rowsCount = rows.count();

        if (rowsCount > dataCount)
        {
            for (const row of rows.skip(dataCount))
            {
                CustomElement.contextUnbind(row);
                this.rowGroup.removeChild(row);
            }
        }
        else if (rowsCount < dataCount)
        {
            datasource.skip(rowsCount).forEach(x => this.rowGroup.appendChild(this.createRow(x, false)));
        }

        rows.zip(datasource, (row, data) => ({ row, data }))
            .forEach(x => x.row.data = x.data);
    }

    public async saveRow(row: DataRow): Promise<void>
    {
        if (row.new)
        {
            row.save();
            this.dataProvider.create(row.reference);

            this._page    = this.dataProvider.pageCount;
            this._editing = true;

            await this.setPage(this._page);

            Observer.notify(this, "page");
        }
        else
        {
            row.save();
            this.dataProvider.update(row.reference);
        }

        row.leaveEdit();

        this._editing = false;
    }

    public undoRow(row: DataRow): void
    {
        if (row.new)
        {
            this.rowGroup.removeChild(row);
        }
        else
        {
            row.undo();
        }

        row.leaveEdit();
        this._editing = false;
    }
}