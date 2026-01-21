import { sendGridConfig } from "./config/sendgrid.config.js";
import sendGrid from '@sendgrid/mail'

export function sendGenericEmail(from: string, to: string, subject: string,text?: string | undefined, html?: string | undefined):Promise<Boolean | Error >{
    try{
        const info = sendGridConfig(to,from,subject,text,html)
        return new Promise((resolve,reject) => {
            sendGrid.send({
                from: info.from,
                to: info.to,
                subject: info.subject,
                text: info.text ?? "",
                html: info.html,
            }).then((res) => {
                return resolve(true)
            })
            .catch((err) => {
                return reject(err)
            })
        })
    }catch(e){
        throw e;
    }
}