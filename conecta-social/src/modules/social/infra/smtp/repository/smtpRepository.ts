export interface SmtpRepository {
    sendGenericEmail(from: string, to: string, subject: string,text?: string | undefined, html?: string | undefined):Promise<Boolean | Error >
}