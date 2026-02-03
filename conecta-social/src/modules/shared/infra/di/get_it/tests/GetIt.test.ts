import { describe, expect, test } from "bun:test";
import { GetItImpl } from "../get_it_impl";

class ServiceA {
  constructor(public readonly value: string) {}
}

class ServiceB {
  constructor(public readonly dep: ServiceA) {}
}

describe("GetItImpl", () => {
  test("registers and resolves singleton", () => {
    const getIt = new GetItImpl();
    const instance = new ServiceA("ok");

    getIt.registerSingleton(ServiceA, instance);

    const resolved = getIt.get(ServiceA);
    expect(resolved).toBe(instance);
  });

  test("registers factory and returns new instance each time", () => {
    const getIt = new GetItImpl();
    let counter = 0;

    getIt.registerFactory(ServiceA, () => new ServiceA(`v${counter++}`));

    const first = getIt.get(ServiceA);
    const second = getIt.get(ServiceA);

    expect(first).not.toBe(second);
    expect(first.value).toBe("v0");
    expect(second.value).toBe("v1");
  });

  test("cached factory reuses instance for same params", () => {
    const getIt = new GetItImpl();

    getIt.registerCachedFactoryParam(ServiceA, (p1: string, p2: number) => {
      return new ServiceA(`${p1}:${p2}:${Math.random()}`);
    });

    const first = getIt.get(ServiceA, { param1: "a", param2: 1 });
    const second = getIt.get(ServiceA, { param1: "a", param2: 1 });
    const third = getIt.get(ServiceA, { param1: "a", param2: 2 });

    expect(first).toBe(second);
    expect(first).not.toBe(third);
  });

  test("lazy singleton builds on first get", () => {
    const getIt = new GetItImpl();
    let created = 0;

    getIt.registerLazySingleton(ServiceA, () => {
      created += 1;
      return new ServiceA("lazy");
    });

    expect(created).toBe(0);
    const instance = getIt.get(ServiceA);
    expect(created).toBe(1);
    const second = getIt.get(ServiceA);
    expect(second).toBe(instance);
    expect(created).toBe(1);
  });

  test("async singleton waits for dependencies", async () => {
    const getIt = new GetItImpl();

    getIt.registerSingleton(ServiceA, new ServiceA("ready"));
    getIt.registerSingletonAsync(
      ServiceB,
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        const dep = getIt.get(ServiceA);
        return new ServiceB(dep);
      },
      { dependsOn: [ServiceA] },
    );

    await getIt.allReady();
    const instance = getIt.get(ServiceB);
    expect(instance.dep.value).toBe("ready");
  });

  test("signalReady marks singleton as ready", async () => {
    const getIt = new GetItImpl();
    const instance = new ServiceA("manual");

    getIt.registerSingleton(ServiceA, instance, { signalsReady: true });

    expect(getIt.isReadySync({ token: ServiceA })).toBe(false);
    getIt.signalReady(instance);
    expect(getIt.isReadySync({ token: ServiceA })).toBe(true);
  });

  test("scopes shadow and restore registrations", async () => {
    const getIt = new GetItImpl();
    const base = new ServiceA("base");
    const scoped = new ServiceA("scoped");

    getIt.registerSingleton(ServiceA, base);
    getIt.pushNewScope({ name: "child" });
    getIt.registerSingleton(ServiceA, scoped);

    expect(getIt.get(ServiceA).value).toBe("scoped");
    await getIt.popScope();
    expect(getIt.get(ServiceA).value).toBe("base");
  });

  test("resetLazySingleton clears instance", async () => {
    const getIt = new GetItImpl();
    let created = 0;

    getIt.registerLazySingleton(ServiceA, () => {
      created += 1;
      return new ServiceA(`v${created}`);
    });

    const first = getIt.get(ServiceA);
    await getIt.resetLazySingleton({ token: ServiceA });
    const second = getIt.get(ServiceA);

    expect(first).not.toBe(second);
    expect(created).toBe(2);
  });
});
