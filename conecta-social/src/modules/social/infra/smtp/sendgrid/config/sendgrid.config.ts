import sendGrid from '@sendgrid/mail'

export const sendGridConfig = (to:string,from:string,subject:string,text?:string,html?:string) => {
    // Chave removida e substituída por variável de ambiente para segurança
    const apiKey = process.env.SENDGRID_API_KEY || '';
    if (!apiKey) {
        console.warn("SENDGRID_API_KEY não está definida!");
    }
    sendGrid.setApiKey(apiKey)
    const info = {
        to: to,
        from: from,
        subject: subject,
        text: text,
        html: html
    }
    return info
}