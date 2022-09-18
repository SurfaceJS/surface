import { inject }     from "@surface/dependency-injection";
import UserRepository from "../repositories/user-repository";
import Store          from "../store";
import type Profile   from "../types/profile";
import type User      from "../types/user";

export default class AuthService
{
    public constructor
    (
        @inject(Store)          private readonly store:      Store,
        @inject(UserRepository) private readonly repository: UserRepository,
    )
    { }

    public async create(model: User): Promise<void>
    {
        await this.repository.create(model);
    }

    public async update(model: User): Promise<void>
    {
        await this.repository.update(model);

        this.store.profile =
        {
            authenticated: true,
            user:
            {
                id:    model.id,
                image: model.image,
                name:  model.name,
                email: model.email,
            }
        };
    }

    public async getByEmail(email: string): Promise<User | null>
    {
        return await this.repository.getByEmail(email);
    }

    public async getById(id: string): Promise<User | null>
    {
        return await this.repository.get(id);
    }

    public getProfile(): Profile
    {
        return this.store.profile;
    }

    public async signIn(model: { email: string, password: string }): Promise<boolean>
    {
        const user = await this.repository.getByEmail(model.email);

        if (user?.password == model.password)
        {
            this.store.profile =
            {
                authenticated: true,
                user:
                {
                    id:    user.id,
                    image: user.image,
                    name:  user.name,
                    email: user.email,
                }
            };

            return true;
        }

        return false;
    }

    public async signOut(): Promise<void>
    {
        this.store.profile =
        {
            authenticated: false,
            user:
            {
                id:    "",
                image: "",
                name:  "",
                email: "",
            }
        };

        return Promise.resolve();
    }
}