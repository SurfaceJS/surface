import { inject } from "@surface/dependency-injection";
import Connection from "../context/connection";
import type Todo  from "../types/todo"
import Repository from "./repository";

export default class TodoRepository extends Repository<Todo>
{
    protected readonly storeName = "todo";

    public constructor(@inject(Connection) connection: Connection)
    {
        super(connection);
    }
}