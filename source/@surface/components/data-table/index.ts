import { clone, objectFactory, Indexer, Nullable as __Nullable__ } from "@surface/core";
import Enumerable                                                  from "@surface/enumerable";
import Component                                                   from "..";
import { attribute, element }                                      from "../decorators";
import localize, { Localization }                                  from "../locales";
import DataCell                                                    from "./data-cell";
import DataFooterGroup                                             from "./data-footer-group";
import DataHeader                                                  from "./data-header";
import DataHeaderGroup                                             from "./data-header-group";
import DataRow                                                     from "./data-row";
import DataRowGroup                                                from "./data-row-group";
import template                                                    from "./index.html";
import style                                                       from "./index.scss";
import IDataProvider, { Criteria }                                 from "./interfaces/data-provider";
import ColumnDefinition                                            from "./internal/column-definition";
import DataProvider                                                from "./internal/data-provider";
import arrayTemplate                                               from "./templates/array.html";
import booleanTemplate                                             from "./templates/boolean.html";
import numberTemplate                                              from "./templates/number.html";
import stringTemplate                                              from "./templates/string.html";

type Nullable<T> = __Nullable__<T>;

@element("surface-data-table", template, style)
export default class DataTable extends Component
{
    private readonly criteria: Criteria;

    private refreshing: boolean = false;

    private readonly _localization: Localization;

    private _datasource:     Array<object> = [];
    private _dataDefinition: object        = { };
    private _editing:        boolean       = false;
    private _infinityScroll: boolean       = false;
    private _page:           number        = 1;
    private _pageCount:      number        = 0;
    private _pageSize:       number        = 10;
    private _total:          number        = 0;

    private readonly columnDefinitions: Enumerable<ColumnDefinition> = Enumerable.empty();

    private rowGroup!: DataRowGroup;

    protected dataProvider: IDataProvider;

    protected get editing(): boolean
    {
        return this._editing;
    }

    protected get localization(): Localization
    {
        return this._localization;
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

    public get dataFooterGroups(): Enumerable<DataFooterGroup>
    {
        return Enumerable.from(Array.from(this.querySelectorAll("surface-data-footer-group")));
    }

    public get dataHeaderGroups(): Enumerable<DataHeaderGroup>
    {
        return Enumerable.from(Array.from(this.querySelectorAll("surface-data-header-group")));
    }

    public get dataRowGroups(): Enumerable<DataRowGroup>
    {
        return Enumerable.from(Array.from(this.querySelectorAll("surface-data-row-group")));
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
            this.dataProvider = new DataProvider(value);

            this.refresh();
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

    @attribute
    public get page(): number
    {
        return this._page;
    }

    public set page(value: number)
    {
        this._page = value;
        this.setPage(value);
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

    public get total(): number
    {
        return this._total;
    }

    public constructor(dataProvider?: Nullable<IDataProvider>)
    {
        super();

        if (!dataProvider)
        {
            dataProvider = Enumerable.from(Array.from(this.querySelectorAll(("*"))))
                .firstOrDefault(x => x.tagName.toLowerCase().endsWith("data-provider")) as Nullable<IDataProvider>;

            if (dataProvider instanceof HTMLElement)
            {
                const clone = dataProvider.cloneNode() as HTMLElement & IDataProvider;

                this.replaceChild(clone, dataProvider);

                this.dataProvider = clone as IDataProvider;
            }
            else
            {
                this.dataProvider = new DataProvider([]);
            }
        }
        else
        {
            this.dataProvider = dataProvider;
        }

        const dataTemplate = this.querySelector<HTMLTemplateElement>("template");

        if (dataTemplate)
        {
            this.columnDefinitions = Enumerable.from(Array.from(dataTemplate.content.querySelectorAll("column-definition")))
                .select(x => new ColumnDefinition(x));

            this.removeChild(dataTemplate);
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

        this.criteria =
        {
            skip:    0,
            take:    this.pageSize,
            filters: [],
            sorting: []
        };

        const lang = this.lang || (document.documentElement && document.documentElement.lang) || window.navigator.language;
        this._localization = localize(lang);
    }

    /*
    private applyCriteria(): void
    {
        const headers = this.queryAll("surface-data-table > surface-data-header-group > surface-data-cell");
    }
    */

    private createData(): object
    {
        return clone(this.dataDefinition);
    }

    private createRow<T extends object>(data: T, isNew: boolean): DataRow;
    private createRow(data: Indexer, isNew: boolean): DataRow
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

            const cell = new DataCell(columnDefinition.editable, index, value ?? "", value);
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
                        innerHTML = //html
                        `
                            <button type="button" :disabled="row.disabled" value="${this._localization.edit}" on:click="row.enterEdit()">
                                <surface-icon name="create"></surface-icon>
                            </button>
                        `;
                    }

                    if (columnDefinition.deleteButtom)
                    {
                        innerHTML = //html
                        `
                            ${innerHTML}
                            <button type="button" :disabled="row.disabled" value="${this._localization.delete}" on:click="dataTable.deleteRow(row)">
                                <surface-icon name="delete"></surface-icon>
                            </button>
                        `;
                    }

                    innerHTML = //html
                    `
                        <surface-switch value="{row.editMode}">
                            <template when="true">
                                <input type="button" value="${this._localization.save}"   horizontal-align="center" on:click="dataTable.saveRow(row)" />
                                <input type="button" value="${this._localization.cancel}" horizontal-align="center" on:click="dataTable.undoRow(row)" />
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
                            innerHTML = (arrayTemplate).replace(/\$\{(field)\}/g, field);
                            break;
                        case "boolean":
                            innerHTML = (booleanTemplate).replace(/\$\{(field)\}/g, field);
                            break;
                        case "number":
                            innerHTML = (numberTemplate).replace(/\$\{(field)\}/g, field);
                            break;
                        case "string":
                        default:
                            innerHTML = (stringTemplate).replace(/\$\{(field)\}/g, field);
                            break;
                    }
                }
            }

            cell.innerHTML = innerHTML;

            // CustomElement.processDirectives(this, cell, { ...this.context, dataTable: this, row, cell });

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
            const footerGroup = new DataFooterGroup();

            const simbling = this.querySelector("surface-data-table > surface-data-footer-group:last-of-type")
                || this.querySelector("surface-data-table > surface-data-header-group:last-of-type");

            if (simbling)
            {
                simbling.insertAdjacentElement("afterend", footerGroup);
            }
            else
            {
                this.appendChild(footerGroup);
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
            const headerGroup = new DataHeaderGroup();

            const simbling = this.querySelector("surface-data-table > surface-data-header-group:last-of-type");

            if (simbling)
            {
                simbling.insertAdjacentElement("afterend", headerGroup);
            }
            else
            {
                this.appendChild(headerGroup);
            }

            const row = new DataRow();

            headerGroup.appendChild(row);

            let index = 0;

            for (const columnDefinition of this.columnDefinitions)
            {
                const actionColumn = columnDefinition.deleteButtom || columnDefinition.editButtom;
                const header = new DataHeader(columnDefinition.header, columnDefinition.sortable && !actionColumn, columnDefinition.filterable && !actionColumn, index);

                if (columnDefinition.style)
                {
                    header.setAttribute("style", columnDefinition.style);
                }

                row.appendChild(header);

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

            const simbling = this.querySelector("surface-data-table > surface-data-row-group:last-of-type")
                || this.querySelector("surface-data-table > surface-data-header-group:last-of-type");

            if (simbling)
            {
                simbling.insertAdjacentElement("afterend", rowGroup);
            }
            else
            {
                this.appendChild(rowGroup);
            }
        }
    }

    private async setPage(page: number): Promise<void>
    {
        this.criteria.skip = (page - 1) * this.pageSize;
        await this.refresh();
    }

    public connectedCallback(): void
    {
        if (!this.refreshing)
        {
            this.refresh();
        }
    }

    public async addNew(): Promise<void>
    {
        if (this.total > 0)
        {
            this._page    = this.pageCount;
            this._editing = true;

            await this.setPage(this._page);

            // this.notify("page");
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

    public async filter(): Promise<void>
    {
        await this.refresh();
    }

    public async sort(field: string, direction: "asc" | "desc"): Promise<void>
    {
        this.criteria.sorting.push({ field, direction });
        await this.refresh();
        this.criteria.sorting = [];
    }

    public async refresh(): Promise<void>
    {
        this.refreshing = true;

        const rows = Enumerable.from(Array.from(this.rowGroup.querySelectorAll<DataRow>("surface-data-row")));

        const result     = await this.dataProvider.read(this.criteria);
        const datasource = Enumerable.from(result.data);

        const pageCount = result.total / this.pageSize;
        this._pageCount = Math.trunc(pageCount) + (pageCount % 1 == 0 ? 0 : 1);

        this._total = result.total;

        const dataCount = datasource.count();
        const rowsCount = rows.count();

        if (rowsCount > dataCount)
        {
            for (const row of rows.skip(dataCount))
            {
                // CustomElement.clearDirectives(row);
                this.rowGroup.removeChild(row);
            }
        }
        else if (rowsCount < dataCount)
        {
            datasource.skip(rowsCount).forEach(x => this.rowGroup.appendChild(this.createRow(x as Indexer, false)));
        }

        rows.zip(datasource, (row, data) => ({ row, data }))
            .forEach(x => x.row.data = x.data);

        this.refreshing = false;
    }

    public async saveRow(row: DataRow): Promise<void>
    {
        if (row.new)
        {
            row.save();

            await this.dataProvider.create(row.reference);

            await this.refresh();

            this._page = this.pageCount;

            await this.setPage(this.pageCount);

            // this.notify("page");
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