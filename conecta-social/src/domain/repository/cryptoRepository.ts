export interface CryptoRepository{
    hashPass(password: string): Promise<string | Error> 
    verifyPass(pass:string,hash:string):Promise<boolean | Error>
}