import { GetItImpl } from "./get_it_impl";

export class GetIt {
  private static _instance = new GetItImpl();

  static get instance(): GetItImpl {
    return this._instance;
  }

  static get I(): GetItImpl {
    return this._instance;
  }

  static asNewInstance(): GetItImpl {
    return new GetItImpl();
  }
}

export * from "./get_it_impl";
