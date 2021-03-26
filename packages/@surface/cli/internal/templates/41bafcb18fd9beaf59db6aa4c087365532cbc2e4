import { inject } from "@surface/dependency-injection";
import Enumerable from "@surface/enumerable";
import Connection from "../context/connection";
import type User  from "../types/user";
import Repository from "./repository";

export default class UserRepository extends Repository<User>
{
    protected readonly storeName = "user";

    public constructor(@inject(Connection) connection: Connection)
    {
        super(connection)
    }

    public async getByEmail(email: string): Promise<User | null>
    {
        const users = await this.getAll() as Enumerable<User>;

        return users.firstOrDefault(x => x.email.toLocaleLowerCase() == email.toLocaleLowerCase());
    }
}