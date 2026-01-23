import * as bcrypt from 'bcrypt'

export async function hashPass(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(8)
    const hash = await bcrypt.hash(password, salt)
    return hash
}

export async function verifyPass(pass:string,hash:string):Promise<boolean>{
    return await bcrypt.compare(pass,hash)
}