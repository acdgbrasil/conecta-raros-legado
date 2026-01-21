export class MongooseClientSingleton {
   private static instance:any | null = null;

    private constructor() { }

    public static setInstance(instance:any) {
        if(!this.instance) {
            this.instance = instance;
        }
    }

    public static get getInstance(): any {
        if (!this.instance) {
            throw new Error('MongooseClientSingleton is not initialized');
        }
        return this.instance;
    }


}