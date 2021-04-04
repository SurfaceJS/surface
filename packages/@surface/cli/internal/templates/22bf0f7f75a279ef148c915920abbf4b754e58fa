import CustomElement         from "@surface/custom-element";
import Container             from "@surface/dependency-injection";
import WebRouter             from "@surface/web-router";
import KeyPressDirective     from "./directives/key-press-directive";
import Localization          from "./locales/localization";
import AuthRouterInterceptor from "./interceptors/auth-router-interceptor";
import Connection            from "./context/connection";
import TodoRepository        from "./repositories/todo-repository";
import UserRepository        from "./repositories/user-repository";
import routes                from "./routes";
import AuthService           from "./services/auth-service";
import Store                 from "./store";

const container = new Container();

container.registerSingleton(AuthService);
container.registerSingleton(Connection);
container.registerSingleton(Localization, () => new Localization(window.navigator.language));
container.registerSingleton(Store);
container.registerSingleton(TodoRepository);
container.registerSingleton(UserRepository);

const router = new WebRouter("app-root", routes, { container, interceptors: [AuthRouterInterceptor] });

CustomElement.registerDirective("to", router.asDirective());
CustomElement.registerDirective("keypress", KeyPressDirective);

void import("./app")
    .then(x => document.body.appendChild(container.inject(x.default)))
    .then(() => void router.pushCurrentLocation());

window.addEventListener('load', () => navigator.serviceWorker?.register('/service-worker.js'));