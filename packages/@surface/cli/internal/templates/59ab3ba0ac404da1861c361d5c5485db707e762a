/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { painting }                     from "@surface/htmlx";
import HTMLXElement, { element, query } from "@surface/htmlx-element";
import { inject }                       from "@surface/dependency-injection";
import Enumerable                       from "@surface/enumerable";
import { IRouteableElement }            from "@surface/web-router";
import Loading                          from "../../components/app-loading";
import Localization                     from "../../locales/localization";
import TodoRepository                   from "../../repositories/todo-repository";
import Store                            from "../../store";
import type Item                        from "../../types/item";
import Todo                             from "../../types/todo";
import template                         from "./index.htmlx";
import style                            from "./index.scss";

@element("home-view", { style, template })

export default class HomeView extends HTMLXElement implements IRouteableElement
{
    @query("#list")
    private readonly listElement!: HTMLDivElement;

    private todo: Todo = { id: "", items: [] };

    public cache: Map<Item, number> = new Map();
    public items: Item[]            = [];
    public showingAll               = true;
    public task                     = "";

    public constructor
    (
        @inject(Store)          public readonly store:        Store,
        @inject(TodoRepository) public readonly repository:   TodoRepository,
        @inject(Localization)   public readonly localization: Localization,
    )
    {
        super();
    }

    public async onRouteEnter(): Promise<void>
    {
        const id = this.store.profile.user.id;

        Loading.show();

        let todo = (await this.repository.get(id));

        if (!todo)
        {
            await this.repository.create(todo = { id, items: [] })
        }

        this.items = (this.todo = todo).items;

        await painting();

        Loading.close();
    }

    public async add(): Promise<void>
    {
        this.items = [...this.items, { id: new Date().getTime(), complete: false, description: this.task }];

        this.task = "";

        await painting();

        this.listElement.scrollTop = this.listElement.scrollHeight;

        await this.save();
    }

    public async removeItem(item: Item): Promise<void>
    {
        this.items = this.items.filter(x => x != item);

        await this.save();
    }

    public async save(): Promise<void>
    {
        await painting();

        this.todo.items = this.items;

        await this.repository.update(this.todo);
    }

    public showOnlyComplete(): void
    {
        for (let i = 0; i < this.items.length; i++)
        {
            this.cache.set(this.items[i], i);
        }

        this.items = this.items.filter(x => x.complete);

        this.showingAll = false;
    }

    public showAll(): void
    {
        const cache = Enumerable.from(Array.from(this.cache.keys()));
        const items = Enumerable.from(this.items);

        const completes = cache.where(x => x.complete);
        const same      = items.intersect(completes);
        const added     = items.except(same);
        const removed   = completes.except(same);

        this.items = cache.except(removed).concat(added).toArray();

        this.cache.clear();

        this.showingAll = true;
    }
}