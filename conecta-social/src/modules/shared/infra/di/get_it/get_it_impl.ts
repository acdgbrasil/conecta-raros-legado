/* eslint-disable @typescript-eslint/no-explicit-any */

type Constructor<T = any> = new (...args: any[]) => T;
export type Token<T = any> = Constructor<T> | string | symbol;

export type FactoryFunc<T> = () => T;
export type FactoryFuncParam<T, P1, P2> = (param1: P1, param2: P2) => T;
export type FactoryFuncAsync<T> = () => Promise<T>;
export type FactoryFuncParamAsync<T, P1, P2> = (
  param1: P1,
  param2: P2,
) => Promise<T>;

export type DisposingFunc<T> = (param: T) => void | Promise<void>;
export type ScopeDisposeFunc = () => void | Promise<void>;

export enum ObjectRegistrationType {
  AlwaysNew,
  Constant,
  Lazy,
  CachedFactory,
}

export interface WillSignalReady {}

export interface ShadowChangeHandlers {
  onGetShadowed(shadowing: unknown): void;
  onLeaveShadow(shadowing: unknown): void;
}

export interface Disposable {
  onDispose(): void | Promise<void>;
}

export class InitDependency {
  readonly token: Token;
  readonly instanceName?: string;

  constructor(token: Token, instanceName?: string) {
    this.token = token;
    this.instanceName = instanceName;
  }

  toString(): string {
    return `InitDependency(token:${tokenToString(this.token)}, instanceName:${
      this.instanceName ?? "<default>"
    })`;
  }
}

export class WaitingTimeoutError extends Error {
  readonly areWaitedBy: Map<string, string[]>;
  readonly notReadyYet: string[];
  readonly areReady: string[];

  constructor(
    areWaitedBy: Map<string, string[]>,
    notReadyYet: string[],
    areReady: string[],
  ) {
    super("GetIt: timeout while waiting for ready instances");
    this.areWaitedBy = areWaitedBy;
    this.notReadyYet = notReadyYet;
    this.areReady = areReady;
  }
}

type RegistrationMap = Map<Token, Map<string | undefined, ObjectRegistration<any, any, any>[]>>;

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function tokenToString(token: Token): string {
  if (typeof token === "string") return token;
  if (typeof token === "symbol") return token.description ?? token.toString();
  if (typeof token === "function") return token.name || "<anonymous>";
  return "<unknown>";
}

function keyToString(token: Token, instanceName?: string): string {
  return `${tokenToString(token)}${instanceName ? `:${instanceName}` : ""}`;
}

const canUseWeakRef = typeof WeakRef !== "undefined";

class ObjectRegistration<T, P1, P2> {
  readonly registrationType: ObjectRegistrationType;
  readonly instanceName?: string;
  readonly isAsync: boolean;
  readonly registeredWithToken: Token;
  readonly useWeakReference: boolean;
  readonly shouldSignalReady: boolean;
  readonly disposeFunction?: DisposingFunc<T>;
  readonly onCreatedCallback?: (instance: T) => void;

  private instanceValue?: T;
  private weakRefValue?: WeakRef<T>;

  lastParam1?: P1;
  lastParam2?: P2;

  readonly creationFunction?: FactoryFunc<T>;
  readonly asyncCreationFunction?: FactoryFuncAsync<T>;
  readonly creationFunctionParam?: FactoryFuncParam<T, P1, P2>;
  readonly asyncCreationFunctionParam?: FactoryFuncParamAsync<T, P1, P2>;

  readonly objectsWaiting: Token[] = [];
  private readyDeferred = createDeferred<void>();
  pendingResult?: Promise<T>;

  constructor(options: {
    registrationType: ObjectRegistrationType;
    registeredWithToken: Token;
    instanceName?: string;
    isAsync: boolean;
    shouldSignalReady: boolean;
    useWeakReference: boolean;
    creationFunction?: FactoryFunc<T>;
    asyncCreationFunction?: FactoryFuncAsync<T>;
    creationFunctionParam?: FactoryFuncParam<T, P1, P2>;
    asyncCreationFunctionParam?: FactoryFuncParamAsync<T, P1, P2>;
    instance?: T;
    disposeFunction?: DisposingFunc<T>;
    onCreatedCallback?: (instance: T) => void;
  }) {
    this.registrationType = options.registrationType;
    this.registeredWithToken = options.registeredWithToken;
    this.instanceName = options.instanceName;
    this.isAsync = options.isAsync;
    this.shouldSignalReady = options.shouldSignalReady;
    this.useWeakReference = options.useWeakReference;
    this.creationFunction = options.creationFunction;
    this.asyncCreationFunction = options.asyncCreationFunction;
    this.creationFunctionParam = options.creationFunctionParam;
    this.asyncCreationFunctionParam = options.asyncCreationFunctionParam;
    this.disposeFunction = options.disposeFunction;
    this.onCreatedCallback = options.onCreatedCallback;

    this.markNotReady();
    if (options.instance) {
      this.setInstance(options.instance);
      if (!this.shouldSignalReady) this.markReady();
    }
  }

  get instance(): T | undefined {
    if (this.useWeakReference && this.weakRefValue) {
      return this.weakRefValue.deref();
    }
    return this.instanceValue;
  }

  get isReady(): boolean {
    return (this as any)._isReady === true;
  }

  get canBeWaitedFor(): boolean {
    return this.shouldSignalReady || this.isAsync || !!this.pendingResult;
  }

  markReady(): void {
    (this as any)._isReady = true;
    this.readyDeferred.resolve();
  }

  markNotReady(): void {
    (this as any)._isReady = false;
    this.readyDeferred = createDeferred<void>();
  }

  readyPromise(): Promise<void> {
    return this.readyDeferred.promise;
  }

  resetInstance(): void {
    this.instanceValue = undefined;
    this.weakRefValue = undefined;
    this.pendingResult = undefined;
    this.markNotReady();
  }

  setInstance(instance: T): void {
    if (this.useWeakReference && canUseWeakRef) {
      this.weakRefValue = new WeakRef(instance);
    } else {
      this.instanceValue = instance;
    }
  }
}

class Scope {
  readonly name: string;
  readonly dispose?: ScopeDisposeFunc;
  readonly registrations: RegistrationMap = new Map();

  constructor(name: string, dispose?: ScopeDisposeFunc) {
    this.name = name;
    this.dispose = dispose;
  }
}

export class GetItImpl {
  static noDebugOutput = false;

  readonly debugEventsEnabled = false;
  allowReassignment = false;
  skipDoubleRegistration = false;
  private allowMultipleInstances = false;

  onScopeChanged?: (pushed: boolean) => void;

  private scopes: Scope[] = [new Scope("baseScope")];

  enableRegisteringMultipleInstancesOfOneType(): void {
    this.allowMultipleInstances = true;
  }

  private get currentScope(): Scope {
    return this.scopes[this.scopes.length - 1];
  }

  get currentScopeName(): string {
    return this.currentScope.name;
  }

  hasScope(name: string): boolean {
    return this.scopes.some((scope) => scope.name === name);
  }

  pushNewScope(options?: { name?: string; dispose?: ScopeDisposeFunc }): void {
    const name = options?.name ?? `scope_${this.scopes.length}`;
    this.scopes.push(new Scope(name, options?.dispose));
    this.onScopeChanged?.(true);
  }

  async pushNewScopeAsync(options?: {
    name?: string;
    init?: (getIt: GetItImpl) => Promise<void> | void;
    dispose?: ScopeDisposeFunc;
  }): Promise<void> {
    this.pushNewScope({ name: options?.name, dispose: options?.dispose });
    if (options?.init) {
      await options.init(this);
    }
  }

  async popScope(): Promise<void> {
    if (this.scopes.length === 1) return;
    const scope = this.scopes.pop();
    if (!scope) return;
    await this.disposeScope(scope);
    await scope.dispose?.();
    this.onScopeChanged?.(false);
  }

  async popScopesTill(name: string, options?: { inclusive?: boolean }): Promise<boolean> {
    const inclusive = options?.inclusive ?? true;
    const index = this.scopes.findIndex((scope) => scope.name === name);
    if (index === -1) return false;
    const targetIndex = inclusive ? index : index + 1;
    while (this.scopes.length - 1 >= targetIndex) {
      if (this.scopes.length === 1) break;
      await this.popScope();
    }
    return true;
  }

  async dropScope(name: string): Promise<void> {
    const index = this.scopes.findIndex((scope) => scope.name === name);
    if (index <= 0) return;
    const scope = this.scopes.splice(index, 1)[0];
    await this.disposeScope(scope);
    await scope.dispose?.();
    this.onScopeChanged?.(false);
  }

  private getRegistration(
    token: Token,
    instanceName?: string,
    options?: { fromAllScopes?: boolean; onlyInScope?: string },
  ): ObjectRegistration<any, any, any> | undefined {
    const scope = this.selectScope(options?.onlyInScope);
    if (scope) {
      return this.findInScope(scope, token, instanceName)?.[0];
    }

    const fromAllScopes = options?.fromAllScopes ?? false;
    const scopesToSearch = fromAllScopes ? [...this.scopes].reverse() : [this.currentScope, ...this.scopes.slice(0, -1).reverse()];
    for (const s of scopesToSearch) {
      const list = this.findInScope(s, token, instanceName);
      if (list && list.length > 0) return list[0];
    }
    return undefined;
  }

  private getAllRegistrations(
    token: Token,
    instanceName?: string,
    options?: { inAllScopes?: boolean; onlyInScope?: string },
  ): ObjectRegistration<any, any, any>[] {
    const scope = this.selectScope(options?.onlyInScope);
    if (scope) {
      return this.findInScope(scope, token, instanceName) ?? [];
    }

    const inAllScopes = options?.inAllScopes ?? false;
    const scopesToSearch = inAllScopes ? [...this.scopes].reverse() : [this.currentScope, ...this.scopes.slice(0, -1).reverse()];
    const results: ObjectRegistration<any, any, any>[] = [];
    for (const s of scopesToSearch) {
      const list = this.findInScope(s, token, instanceName);
      if (list?.length) results.push(...list);
    }
    return results;
  }

  private selectScope(onlyInScope?: string): Scope | undefined {
    if (!onlyInScope) return undefined;
    const scope = this.scopes.find((s) => s.name === onlyInScope);
    if (!scope) {
      throw new Error(`GetIt: scope '${onlyInScope}' does not exist`);
    }
    return scope;
  }

  private findInScope(
    scope: Scope,
    token: Token,
    instanceName?: string,
  ): ObjectRegistration<any, any, any>[] | undefined {
    const byToken = scope.registrations.get(token);
    if (!byToken) return undefined;
    return byToken.get(instanceName);
  }

  private insertRegistration(
    scope: Scope,
    token: Token,
    registration: ObjectRegistration<any, any, any>,
  ): void {
    let byToken = scope.registrations.get(token);
    if (!byToken) {
      byToken = new Map();
      scope.registrations.set(token, byToken);
    }
    const list = byToken.get(registration.instanceName);
    if (!list) {
      byToken.set(registration.instanceName, [registration]);
      return;
    }

    if (!this.allowMultipleInstances && !this.allowReassignment && !this.skipDoubleRegistration) {
      throw new Error(
        `GetIt: type '${tokenToString(token)}' already registered${
          registration.instanceName ? ` with name '${registration.instanceName}'` : ""
        }`,
      );
    }

    if (this.allowReassignment) {
      list.length = 0;
    }
    list.push(registration);
  }

  private removeRegistration(
    scope: Scope,
    token: Token,
    instanceName?: string,
  ): ObjectRegistration<any, any, any> | undefined {
    const byToken = scope.registrations.get(token);
    if (!byToken) return undefined;
    const list = byToken.get(instanceName);
    if (!list || list.length === 0) return undefined;
    const removed = list.pop();
    if (list.length === 0) {
      byToken.delete(instanceName);
      if (byToken.size === 0) scope.registrations.delete(token);
    }
    return removed;
  }

  private findShadowedRegistration(token: Token, instanceName?: string): ObjectRegistration<any, any, any> | undefined {
    for (let i = this.scopes.length - 2; i >= 0; i -= 1) {
      const reg = this.findInScope(this.scopes[i], token, instanceName)?.[0];
      if (reg) return reg;
    }
    return undefined;
  }

  private notifyShadowing(registration: ObjectRegistration<any, any, any>): void {
    const shadowed = this.findShadowedRegistration(registration.registeredWithToken, registration.instanceName);
    const shadowedInstance = shadowed?.instance;
    if (shadowedInstance && this.isShadowHandler(shadowedInstance)) {
      shadowedInstance.onGetShadowed(registration.instance ?? registration);
    }
  }

  private notifyUnshadow(registration: ObjectRegistration<any, any, any>): void {
    const shadowed = this.findShadowedRegistration(registration.registeredWithToken, registration.instanceName);
    const shadowedInstance = shadowed?.instance;
    if (shadowedInstance && this.isShadowHandler(shadowedInstance)) {
      shadowedInstance.onLeaveShadow(registration.instance ?? registration);
    }
  }

  private isShadowHandler(value: unknown): value is ShadowChangeHandlers {
    return (
      typeof value === "object" &&
      value !== null &&
      "onGetShadowed" in value &&
      "onLeaveShadow" in value
    );
  }

  private isDisposable(value: unknown): value is Disposable {
    return typeof value === "object" && value !== null && "onDispose" in value;
  }

  private async disposeRegistration(registration: ObjectRegistration<any, any, any>): Promise<void> {
    const instance = registration.instance;
    if (instance && this.isDisposable(instance)) {
      await instance.onDispose();
      return;
    }
    if (instance && registration.disposeFunction) {
      await registration.disposeFunction(instance);
    }
  }

  private async disposeScope(scope: Scope): Promise<void> {
    for (const byToken of scope.registrations.values()) {
      for (const list of byToken.values()) {
        for (const registration of list) {
          await this.disposeRegistration(registration);
          this.notifyUnshadow(registration);
        }
      }
    }
    scope.registrations.clear();
  }

  registerFactory<T>(
    token: Token<T>,
    factory: FactoryFunc<T>,
    options?: { instanceName?: string; dispose?: DisposingFunc<T>; onCreated?: (instance: T) => void },
  ): void {
    const registration = new ObjectRegistration<T, never, never>({
      registrationType: ObjectRegistrationType.AlwaysNew,
      registeredWithToken: token,
      instanceName: options?.instanceName,
      isAsync: false,
      shouldSignalReady: false,
      useWeakReference: false,
      creationFunction: factory,
      disposeFunction: options?.dispose,
      onCreatedCallback: options?.onCreated,
    });

    this.insertRegistration(this.currentScope, token, registration);
    this.notifyShadowing(registration);
  }

  registerCachedFactory<T>(
    token: Token<T>,
    factory: FactoryFunc<T>,
    options?: { instanceName?: string; dispose?: DisposingFunc<T>; onCreated?: (instance: T) => void },
  ): void {
    const registration = new ObjectRegistration<T, never, never>({
      registrationType: ObjectRegistrationType.CachedFactory,
      registeredWithToken: token,
      instanceName: options?.instanceName,
      isAsync: false,
      shouldSignalReady: false,
      useWeakReference: true,
      creationFunction: factory,
      disposeFunction: options?.dispose,
      onCreatedCallback: options?.onCreated,
    });

    this.insertRegistration(this.currentScope, token, registration);
    this.notifyShadowing(registration);
  }

  registerFactoryParam<T, P1, P2>(
    token: Token<T>,
    factory: FactoryFuncParam<T, P1, P2>,
    options?: { instanceName?: string; dispose?: DisposingFunc<T>; onCreated?: (instance: T) => void },
  ): void {
    const registration = new ObjectRegistration<T, P1, P2>({
      registrationType: ObjectRegistrationType.AlwaysNew,
      registeredWithToken: token,
      instanceName: options?.instanceName,
      isAsync: false,
      shouldSignalReady: false,
      useWeakReference: false,
      creationFunctionParam: factory,
      disposeFunction: options?.dispose,
      onCreatedCallback: options?.onCreated,
    });

    this.insertRegistration(this.currentScope, token, registration);
    this.notifyShadowing(registration);
  }

  registerCachedFactoryParam<T, P1, P2>(
    token: Token<T>,
    factory: FactoryFuncParam<T, P1, P2>,
    options?: { instanceName?: string; dispose?: DisposingFunc<T>; onCreated?: (instance: T) => void },
  ): void {
    const registration = new ObjectRegistration<T, P1, P2>({
      registrationType: ObjectRegistrationType.CachedFactory,
      registeredWithToken: token,
      instanceName: options?.instanceName,
      isAsync: false,
      shouldSignalReady: false,
      useWeakReference: true,
      creationFunctionParam: factory,
      disposeFunction: options?.dispose,
      onCreatedCallback: options?.onCreated,
    });

    this.insertRegistration(this.currentScope, token, registration);
    this.notifyShadowing(registration);
  }

  registerFactoryAsync<T>(
    token: Token<T>,
    factory: FactoryFuncAsync<T>,
    options?: { instanceName?: string; dispose?: DisposingFunc<T>; onCreated?: (instance: T) => void },
  ): void {
    const registration = new ObjectRegistration<T, never, never>({
      registrationType: ObjectRegistrationType.AlwaysNew,
      registeredWithToken: token,
      instanceName: options?.instanceName,
      isAsync: true,
      shouldSignalReady: false,
      useWeakReference: false,
      asyncCreationFunction: factory,
      disposeFunction: options?.dispose,
      onCreatedCallback: options?.onCreated,
    });

    this.insertRegistration(this.currentScope, token, registration);
    this.notifyShadowing(registration);
  }

  registerCachedFactoryAsync<T>(
    token: Token<T>,
    factory: FactoryFuncAsync<T>,
    options?: { instanceName?: string; dispose?: DisposingFunc<T>; onCreated?: (instance: T) => void },
  ): void {
    const registration = new ObjectRegistration<T, never, never>({
      registrationType: ObjectRegistrationType.CachedFactory,
      registeredWithToken: token,
      instanceName: options?.instanceName,
      isAsync: true,
      shouldSignalReady: false,
      useWeakReference: true,
      asyncCreationFunction: factory,
      disposeFunction: options?.dispose,
      onCreatedCallback: options?.onCreated,
    });

    this.insertRegistration(this.currentScope, token, registration);
    this.notifyShadowing(registration);
  }

  registerFactoryParamAsync<T, P1, P2>(
    token: Token<T>,
    factory: FactoryFuncParamAsync<T, P1, P2>,
    options?: { instanceName?: string; dispose?: DisposingFunc<T>; onCreated?: (instance: T) => void },
  ): void {
    const registration = new ObjectRegistration<T, P1, P2>({
      registrationType: ObjectRegistrationType.AlwaysNew,
      registeredWithToken: token,
      instanceName: options?.instanceName,
      isAsync: true,
      shouldSignalReady: false,
      useWeakReference: false,
      asyncCreationFunctionParam: factory,
      disposeFunction: options?.dispose,
      onCreatedCallback: options?.onCreated,
    });

    this.insertRegistration(this.currentScope, token, registration);
    this.notifyShadowing(registration);
  }

  registerCachedFactoryParamAsync<T, P1, P2>(
    token: Token<T>,
    factory: FactoryFuncParamAsync<T, P1, P2>,
    options?: { instanceName?: string; dispose?: DisposingFunc<T>; onCreated?: (instance: T) => void },
  ): void {
    const registration = new ObjectRegistration<T, P1, P2>({
      registrationType: ObjectRegistrationType.CachedFactory,
      registeredWithToken: token,
      instanceName: options?.instanceName,
      isAsync: true,
      shouldSignalReady: false,
      useWeakReference: true,
      asyncCreationFunctionParam: factory,
      disposeFunction: options?.dispose,
      onCreatedCallback: options?.onCreated,
    });

    this.insertRegistration(this.currentScope, token, registration);
    this.notifyShadowing(registration);
  }

  registerSingleton<T>(
    token: Token<T>,
    instance: T,
    options?: { instanceName?: string; signalsReady?: boolean; dispose?: DisposingFunc<T> },
  ): void {
    const registration = new ObjectRegistration<T, never, never>({
      registrationType: ObjectRegistrationType.Constant,
      registeredWithToken: token,
      instanceName: options?.instanceName,
      isAsync: false,
      shouldSignalReady: options?.signalsReady ?? false,
      useWeakReference: false,
      instance,
      disposeFunction: options?.dispose,
    });

    this.insertRegistration(this.currentScope, token, registration);
    this.notifyShadowing(registration);
  }

  registerSingletonWithDependencies<T>(
    token: Token<T>,
    factory: FactoryFunc<T>,
    options?: {
      instanceName?: string;
      dependsOn?: Array<InitDependency | Token>;
      signalsReady?: boolean;
      dispose?: DisposingFunc<T>;
    },
  ): void {
    const registration = new ObjectRegistration<T, never, never>({
      registrationType: ObjectRegistrationType.Constant,
      registeredWithToken: token,
      instanceName: options?.instanceName,
      isAsync: true,
      shouldSignalReady: options?.signalsReady ?? false,
      useWeakReference: false,
      creationFunction: factory,
      disposeFunction: options?.dispose,
    });

    this.insertRegistration(this.currentScope, token, registration);
    this.notifyShadowing(registration);
    this.initSingletonWithDependencies(registration, options?.dependsOn ?? []);
  }

  registerSingletonAsync<T>(
    token: Token<T>,
    factory: FactoryFuncAsync<T>,
    options?: {
      instanceName?: string;
      dependsOn?: Array<InitDependency | Token>;
      signalsReady?: boolean;
      dispose?: DisposingFunc<T>;
    },
  ): void {
    const registration = new ObjectRegistration<T, never, never>({
      registrationType: ObjectRegistrationType.Constant,
      registeredWithToken: token,
      instanceName: options?.instanceName,
      isAsync: true,
      shouldSignalReady: options?.signalsReady ?? false,
      useWeakReference: false,
      asyncCreationFunction: factory,
      disposeFunction: options?.dispose,
    });

    this.insertRegistration(this.currentScope, token, registration);
    this.notifyShadowing(registration);
    this.initSingletonWithDependencies(registration, options?.dependsOn ?? []);
  }

  registerLazySingleton<T>(
    token: Token<T>,
    factory: FactoryFunc<T>,
    options?: {
      instanceName?: string;
      signalsReady?: boolean;
      dispose?: DisposingFunc<T>;
      onCreated?: (instance: T) => void;
    },
  ): void {
    const registration = new ObjectRegistration<T, never, never>({
      registrationType: ObjectRegistrationType.Lazy,
      registeredWithToken: token,
      instanceName: options?.instanceName,
      isAsync: false,
      shouldSignalReady: options?.signalsReady ?? false,
      useWeakReference: false,
      creationFunction: factory,
      disposeFunction: options?.dispose,
      onCreatedCallback: options?.onCreated,
    });

    this.insertRegistration(this.currentScope, token, registration);
    this.notifyShadowing(registration);
  }

  registerLazySingletonAsync<T>(
    token: Token<T>,
    factory: FactoryFuncAsync<T>,
    options?: {
      instanceName?: string;
      signalsReady?: boolean;
      dispose?: DisposingFunc<T>;
      onCreated?: (instance: T) => void;
    },
  ): void {
    const registration = new ObjectRegistration<T, never, never>({
      registrationType: ObjectRegistrationType.Lazy,
      registeredWithToken: token,
      instanceName: options?.instanceName,
      isAsync: true,
      shouldSignalReady: options?.signalsReady ?? false,
      useWeakReference: false,
      asyncCreationFunction: factory,
      disposeFunction: options?.dispose,
      onCreatedCallback: options?.onCreated,
    });

    this.insertRegistration(this.currentScope, token, registration);
    this.notifyShadowing(registration);
  }

  private async initSingletonWithDependencies(
    registration: ObjectRegistration<any, any, any>,
    dependsOn: Array<InitDependency | Token>,
  ): Promise<void> {
    const deps = dependsOn.map((dep) =>
      dep instanceof InitDependency ? dep : new InitDependency(dep),
    );
    await Promise.all(
      deps.map((dep) =>
        this.isReady({ token: dep.token, instanceName: dep.instanceName }),
      ),
    );

    if (registration.asyncCreationFunction) {
      registration.pendingResult = registration.asyncCreationFunction().then((instance) => {
        registration.setInstance(instance);
        registration.onCreatedCallback?.(instance);
        if (!registration.shouldSignalReady) registration.markReady();
        return instance;
      });
      return;
    }

    if (registration.creationFunction) {
      const instance = registration.creationFunction();
      registration.setInstance(instance);
      registration.onCreatedCallback?.(instance);
      if (!registration.shouldSignalReady) registration.markReady();
    }
  }

  get<T>(
    token: Token<T>,
    options?: {
      instanceName?: string;
      param1?: unknown;
      param2?: unknown;
      fromAllScopes?: boolean;
      onlyInScope?: string;
    },
  ): T {
    const registration = this.getRegistration(token, options?.instanceName, {
      fromAllScopes: options?.fromAllScopes,
      onlyInScope: options?.onlyInScope,
    });

    if (!registration) {
      throw new Error(
        `GetIt: type '${tokenToString(token)}' not registered${
          options?.instanceName ? ` with name '${options.instanceName}'` : ""
        }`,
      );
    }

    if (registration.isAsync && !registration.instance) {
      throw new Error(
        `GetIt: '${keyToString(token, options?.instanceName)}' is async; use getAsync() or await isReady().`,
      );
    }

    return this.getInstance(registration, options?.param1, options?.param2) as T;
  }

  async getAsync<T>(
    token: Token<T>,
    options?: {
      instanceName?: string;
      param1?: unknown;
      param2?: unknown;
      fromAllScopes?: boolean;
      onlyInScope?: string;
    },
  ): Promise<T> {
    const registration = this.getRegistration(token, options?.instanceName, {
      fromAllScopes: options?.fromAllScopes,
      onlyInScope: options?.onlyInScope,
    });

    if (!registration) {
      throw new Error(
        `GetIt: type '${tokenToString(token)}' not registered${
          options?.instanceName ? ` with name '${options.instanceName}'` : ""
        }`,
      );
    }

    return (await this.getInstanceAsync(registration, options?.param1, options?.param2)) as T;
  }

  getAll<T>(
    token: Token<T>,
    options?: { inAllScopes?: boolean; onlyInScope?: string; instanceName?: string },
  ): T[] {
    const registrations = this.getAllRegistrations(token, options?.instanceName, {
      inAllScopes: options?.inAllScopes,
      onlyInScope: options?.onlyInScope,
    });

    return registrations.map((registration) => this.getInstance(registration) as T);
  }

  async getAllAsync<T>(
    token: Token<T>,
    options?: { inAllScopes?: boolean; onlyInScope?: string; instanceName?: string },
  ): Promise<T[]> {
    const registrations = this.getAllRegistrations(token, options?.instanceName, {
      inAllScopes: options?.inAllScopes,
      onlyInScope: options?.onlyInScope,
    });

    const results: T[] = [];
    for (const registration of registrations) {
      results.push((await this.getInstanceAsync(registration)) as T);
    }
    return results;
  }

  isRegistered(token: Token, options?: { instanceName?: string; onlyInScope?: string }): boolean {
    return !!this.getRegistration(token, options?.instanceName, {
      onlyInScope: options?.onlyInScope,
    });
  }

  async allReady(options?: { timeoutMs?: number; ignorePendingAsyncCreation?: boolean }): Promise<void> {
    const waitFor = this.collectWaitableRegistrations(options?.ignorePendingAsyncCreation);
    if (waitFor.length === 0) return;

    const readyPromises = waitFor.map((registration) => registration.readyPromise());
    if (!options?.timeoutMs) {
      await Promise.all(readyPromises);
      return;
    }

    await this.awaitWithTimeout(Promise.all(readyPromises), options.timeoutMs, undefined, waitFor);
  }

  async isReady(options: {
    token: Token;
    instanceName?: string;
    timeoutMs?: number;
    callee?: Token;
  }): Promise<void> {
    const registration = this.getRegistration(options.token, options.instanceName);
    if (!registration) {
      throw new Error(
        `GetIt: type '${tokenToString(options.token)}' not registered${
          options.instanceName ? ` with name '${options.instanceName}'` : ""
        }`,
      );
    }

    if (registration.isReady) return;

    if (options.callee) {
      registration.objectsWaiting.push(options.callee);
    }

    const promise = registration.readyPromise();
    if (!options.timeoutMs) {
      await promise;
      return;
    }

    await this.awaitWithTimeout(promise, options.timeoutMs, registration, [registration]);
  }

  isReadySync(options: { token: Token; instanceName?: string }): boolean {
    const registration = this.getRegistration(options.token, options.instanceName);
    return registration?.isReady ?? false;
  }

  allReadySync(ignorePendingAsyncCreation = false): boolean {
    const waitFor = this.collectWaitableRegistrations(ignorePendingAsyncCreation);
    return waitFor.every((registration) => registration.isReady);
  }

  signalReady(instanceOrToken?: unknown, options?: { instanceName?: string }): void {
    const registration = this.findRegistrationForSignal(instanceOrToken, options?.instanceName);
    if (!registration) {
      throw new Error("GetIt: signalReady failed; no matching registration found");
    }
    registration.markReady();
  }

  private findRegistrationForSignal(
    instanceOrToken?: unknown,
    instanceName?: string,
  ): ObjectRegistration<any, any, any> | undefined {
    if (!instanceOrToken) return undefined;

    if (typeof instanceOrToken === "function" || typeof instanceOrToken === "string" || typeof instanceOrToken === "symbol") {
      return this.getRegistration(instanceOrToken as Token, instanceName);
    }

    for (const scope of [...this.scopes].reverse()) {
      for (const byToken of scope.registrations.values()) {
        for (const list of byToken.values()) {
          for (const registration of list) {
            if (registration.instance === instanceOrToken) return registration;
          }
        }
      }
    }
    return undefined;
  }

  async reset(options?: { dispose?: boolean }): Promise<void> {
    const dispose = options?.dispose ?? true;
    for (let i = this.scopes.length - 1; i >= 0; i -= 1) {
      if (!dispose) {
        this.scopes[i].registrations.clear();
        continue;
      }
      await this.disposeScope(this.scopes[i]);
    }
    this.scopes = [new Scope("baseScope")];
  }

  async resetScope(options?: { dispose?: boolean }): Promise<void> {
    const dispose = options?.dispose ?? true;
    const scope = this.currentScope;
    if (!dispose) {
      scope.registrations.clear();
      return;
    }
    await this.disposeScope(scope);
  }

  async resetLazySingleton<T>(options: {
    token: Token<T>;
    instanceName?: string;
    disposingFunction?: DisposingFunc<T>;
  }): Promise<void> {
    const registration = this.getRegistration(options.token, options.instanceName);
    if (!registration) return;
    if (registration.registrationType !== ObjectRegistrationType.Lazy) return;

    const instance = registration.instance;
    if (instance && options.disposingFunction) {
      await options.disposingFunction(instance as T);
    } else if (instance) {
      await this.disposeRegistration(registration);
    }
    registration.resetInstance();
  }

  async resetLazySingletons(options?: {
    inAllScopes?: boolean;
    onlyInScope?: string;
  }): Promise<void> {
    const scope = this.selectScope(options?.onlyInScope);
    const scopes = scope
      ? [scope]
      : options?.inAllScopes
        ? this.scopes
        : [this.currentScope];

    for (const s of scopes) {
      for (const byToken of s.registrations.values()) {
        for (const list of byToken.values()) {
          for (const registration of list) {
            if (registration.registrationType === ObjectRegistrationType.Lazy) {
              await this.disposeRegistration(registration);
              registration.resetInstance();
            }
          }
        }
      }
    }
  }

  async unregister<T>(options: {
    token: Token<T>;
    instanceName?: string;
    disposingFunction?: DisposingFunc<T>;
  }): Promise<void> {
    const registration = this.removeRegistration(this.currentScope, options.token, options.instanceName);
    if (!registration) return;

    const instance = registration.instance as T | undefined;
    if (instance && options.disposingFunction) {
      await options.disposingFunction(instance);
    } else {
      await this.disposeRegistration(registration);
    }

    this.notifyUnshadow(registration);
  }

  private collectWaitableRegistrations(ignorePendingAsyncCreation?: boolean): ObjectRegistration<any, any, any>[] {
    const registrations: ObjectRegistration<any, any, any>[] = [];
    for (const scope of this.scopes) {
      for (const byToken of scope.registrations.values()) {
        for (const list of byToken.values()) {
          for (const registration of list) {
            if (!registration.canBeWaitedFor) continue;
            if (ignorePendingAsyncCreation && registration.pendingResult) continue;
            registrations.push(registration);
          }
        }
      }
    }
    return registrations;
  }

  private async awaitWithTimeout(
    promise: Promise<void>,
    timeoutMs: number,
    singleRegistration?: ObjectRegistration<any, any, any>,
    registrations?: ObjectRegistration<any, any, any>[],
  ): Promise<void> {
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<void>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        const waitList = registrations ?? (singleRegistration ? [singleRegistration] : []);
        const areWaitedBy = new Map<string, string[]>();
        const notReadyYet: string[] = [];
        const areReady: string[] = [];
        for (const reg of waitList) {
          const name = keyToString(reg.registeredWithToken, reg.instanceName);
          if (reg.isReady) {
            areReady.push(name);
          } else {
            notReadyYet.push(name);
            if (reg.objectsWaiting.length) {
              areWaitedBy.set(name, reg.objectsWaiting.map(tokenToString));
            }
          }
        }
        reject(new WaitingTimeoutError(areWaitedBy, notReadyYet, areReady));
      }, timeoutMs);
    });

    try {
      await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }
  }

  private getInstance(
    registration: ObjectRegistration<any, any, any>,
    param1?: unknown,
    param2?: unknown,
  ): unknown {
    if (registration.registrationType === ObjectRegistrationType.AlwaysNew) {
      return this.createInstance(registration, param1, param2);
    }

    if (registration.registrationType === ObjectRegistrationType.CachedFactory) {
      const cached = registration.instance;
      if (
        cached &&
        registration.lastParam1 === (param1 as any) &&
        registration.lastParam2 === (param2 as any)
      ) {
        return cached;
      }
      const instance = this.createInstance(registration, param1, param2);
      registration.lastParam1 = param1 as any;
      registration.lastParam2 = param2 as any;
      registration.setInstance(instance as any);
      return instance;
    }

    if (registration.instance) {
      return registration.instance;
    }

    if (registration.registrationType === ObjectRegistrationType.Lazy) {
      const instance = this.createInstance(registration, param1, param2);
      registration.setInstance(instance as any);
      registration.onCreatedCallback?.(instance as any);
      if (!registration.shouldSignalReady) registration.markReady();
      return instance;
    }

    return registration.instance;
  }

  private async getInstanceAsync(
    registration: ObjectRegistration<any, any, any>,
    param1?: unknown,
    param2?: unknown,
  ): Promise<unknown> {
    if (registration.registrationType === ObjectRegistrationType.AlwaysNew) {
      return this.createInstanceAsync(registration, param1, param2);
    }

    if (registration.registrationType === ObjectRegistrationType.CachedFactory) {
      const cached = registration.instance;
      if (
        cached &&
        registration.lastParam1 === (param1 as any) &&
        registration.lastParam2 === (param2 as any)
      ) {
        return cached;
      }
      const instance = await this.createInstanceAsync(registration, param1, param2);
      registration.lastParam1 = param1 as any;
      registration.lastParam2 = param2 as any;
      registration.setInstance(instance as any);
      return instance;
    }

    if (registration.instance) {
      return registration.instance;
    }

    if (registration.registrationType === ObjectRegistrationType.Lazy) {
      if (registration.pendingResult) {
        return registration.pendingResult;
      }
      registration.pendingResult = this.createInstanceAsync(registration, param1, param2).then(
        (instance) => {
          registration.setInstance(instance as any);
          registration.onCreatedCallback?.(instance as any);
          if (!registration.shouldSignalReady) registration.markReady();
          return instance as any;
        },
      );
      return registration.pendingResult;
    }

    if (registration.pendingResult) {
      return registration.pendingResult;
    }

    return registration.instance;
  }

  private createInstance(
    registration: ObjectRegistration<any, any, any>,
    param1?: unknown,
    param2?: unknown,
  ): unknown {
    if (registration.creationFunctionParam) {
      return registration.creationFunctionParam(param1 as any, param2 as any);
    }
    if (registration.creationFunction) {
      return registration.creationFunction();
    }
    if (registration.asyncCreationFunction || registration.asyncCreationFunctionParam) {
      throw new Error("GetIt: async factory accessed via get(); use getAsync()");
    }
    return registration.instance;
  }

  private async createInstanceAsync(
    registration: ObjectRegistration<any, any, any>,
    param1?: unknown,
    param2?: unknown,
  ): Promise<unknown> {
    if (registration.asyncCreationFunctionParam) {
      const instance = await registration.asyncCreationFunctionParam(param1 as any, param2 as any);
      registration.onCreatedCallback?.(instance as any);
      if (!registration.shouldSignalReady) registration.markReady();
      return instance;
    }

    if (registration.asyncCreationFunction) {
      const instance = await registration.asyncCreationFunction();
      registration.onCreatedCallback?.(instance as any);
      if (!registration.shouldSignalReady) registration.markReady();
      return instance;
    }

    return this.createInstance(registration, param1, param2);
  }
}

export { Constructor };
