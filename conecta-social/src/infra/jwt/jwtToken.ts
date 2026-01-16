import express from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from '../error/error.js';

/**
 * Creates a JWT token with the given payload and expiration time.
 * @param payload - The payload to be included in the token.
 * @param timer - The expiration time for the token in seconds.
 * @returns The generated JWT token.
 */
export function createToken(payload:string,timer:number):string{
    return jwt.sign({"pay":payload},process.env.JWT_PASS_KEY!,{expiresIn:timer})
}

export function createPassEmailToken(payload:string,timer:number):string{
    return jwt.sign({"pay":payload},process.env.JWT_EMAIL_KEY!,{expiresIn:timer})
}

export function _verifyPassEmailToken(token:string):Map<string,Error | boolean | string | undefined | jwt.JwtPayload>{
    let result = new Map<string,Error | boolean | string | undefined | jwt.JwtPayload>()
    jwt.verify(token,process.env.JWT_EMAIL_KEY!,function (err,decode){
        if(err){
            result.set("hasError",true)
            result.set("value",err)
        }else{
            result.set("hasError",false)
            result.set("value",decode)
        }
    })
    return result
}

function _verifyToken(token:string):Map<string,Error | boolean | string | undefined | jwt.JwtPayload>{
    let result = new Map<string,Error | boolean | string | undefined | jwt.JwtPayload>()
    jwt.verify(token,process.env.JWT_PASS_KEY!,function (err,decode){
        if(err){
            result.set("hasError",true)
            result.set("value",err)
        }else{
            result.set("hasError",false)
            result.set("value",decode)
        }
    })
    return result
}

/**
 * Middleware function to verify the authenticity of a JWT token in the request header.
 * If the token is missing, malformatted, or invalid, it returns an error response.
 * Otherwise, it calls the next middleware function.
 * 
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 */
export function verifyToken(req:express.Request,res:express.Response,next:any){
    
    const header = req.headers.authorization
    
    if(!header){
        const error = new CustomError('Unauthorized',401,'Unauthorized','Token not provided')
        return res.status(401).json(error.toJson('Token not provided'))
    }

    const parts = header.split(' ')
    const partsLen = parts.length
    if(partsLen !== 2){
        const error = new CustomError('Unauthorized',401,'Unauthorized','Token malformatted')
        return res.status(401).json(error.toJson('Token malformatted'))
    }

    const [scheme,token] = parts

    if(!/^Bearer$/i.test(scheme)){
        const error = new CustomError('Unauthorized',401,'Unauthorized','Token malformatted')
        return res.status(401).json(error.toJson('Token without Bearer'))
    }

    const jwtVerifyMap = _verifyToken(token)
    const hasError = jwtVerifyMap.get('hasError')
    const value = jwtVerifyMap.get('value')
    
    if(hasError == true){
        const error = new CustomError('Unauthorized',401,'Unauthorized','Token invalid')
        return res.status(403).json(error.toJson('Token invalid')) 
    } 

    // Attach decoded user payload to response locals for downstream use
    res.locals.user = value;

    return next()

}
  