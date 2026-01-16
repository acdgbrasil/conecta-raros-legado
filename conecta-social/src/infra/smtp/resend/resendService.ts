import {Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function resendGenericEmail(from: string, to: string, subject: string,html: string,text?:string): Promise<Boolean | Error> {
    try{
        const a = await fetch('https://api.resend.com/emails',{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'},
            body: JSON.stringify({
                from: from,
                to: to,
                subject: subject,
                html: html || "",
            })})

        const response = await a.json();
        return true;
    }catch(e){
        throw new Error(`Error sending email: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
}