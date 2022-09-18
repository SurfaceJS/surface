import type Profile from "./types/profile";

const PREFIX      = "surface.todo-app.com";
const PROFILE_KEY = `${PREFIX}.profile`;

export default class Store
{
    private _profile: Profile | null = JSON.parse(window.localStorage.getItem(PROFILE_KEY) ?? "null");

    public get profile() : Profile
    {
        return this._profile ??
        {
            authenticated: false,
            user:
            {
                id:    "",
                image: "",
                email: "",
                name:  "",
            }
        };
    }

    public set profile(value : Profile)
    {
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(value ?? "null"));

        this._profile = value;
    }
}