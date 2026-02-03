# GetIt (TypeScript)

Service locator inspirado no GetIt (Dart), com foco em Bun + TypeScript.

## Uso rapido

```ts
import { GetIt } from "@modules/shared/infra/di/get_it/get_it";

class UserRepo {}
class AuthService {
  constructor(public readonly repo: UserRepo) {}
}

const getIt = GetIt.instance;

getIt.registerSingleton(UserRepo, new UserRepo());
getIt.registerFactory(AuthService, () => new AuthService(getIt.get(UserRepo)));

const auth = getIt.get(AuthService);
```

## Registro

- Singleton
```ts
getIt.registerSingleton(UserRepo, new UserRepo());
```

- Lazy singleton (cria no primeiro get)
```ts
getIt.registerLazySingleton(UserRepo, () => new UserRepo());
```

- Factory (sempre cria novo)
```ts
getIt.registerFactory(AuthService, () => new AuthService(getIt.get(UserRepo)));
```

- Factory com parametros
```ts
getIt.registerFactoryParam(AuthService, (repo: UserRepo, token: string) => {
  return new AuthService(repo);
});

const auth = getIt.get(AuthService, { param1: getIt.get(UserRepo), param2: "t" });
```

## Async + readiness

```ts
getIt.registerSingletonAsync(UserRepo, async () => new UserRepo());
await getIt.allReady();
const repo = getIt.get(UserRepo);
```

Para readiness manual:
```ts
getIt.registerSingleton(UserRepo, new UserRepo(), { signalsReady: true });
getIt.signalReady(UserRepo);
```

## Scopes

```ts
getIt.registerSingleton(UserRepo, new UserRepo());
getIt.pushNewScope({ name: "request" });
getIt.registerSingleton(UserRepo, new UserRepo());

const scoped = getIt.get(UserRepo);
await getIt.popScope();
const base = getIt.get(UserRepo);
```

## Reset e limpeza

```ts
await getIt.reset();
await getIt.resetScope();
await getIt.resetLazySingleton({ token: UserRepo });
await getIt.unregister({ token: UserRepo });
```
