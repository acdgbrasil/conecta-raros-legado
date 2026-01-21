import { SmtpRepository } from "./repository/smtpRepository.js";
import { resendGenericEmail } from "./resend/resendService.js";
import { sendGenericEmail } from "./sendgrid/sendGridDto.js";

/**
 * Service for sending generic emails using SMTP.
 */
export class SmtpService implements SmtpRepository{
    /**
     * Sends a generic email.
     * @param from - The email address of the sender.
     * @param to - The email address of the recipient.
     * @param subject - The subject of the email.
     * @param text - The plain text content of the email (optional).
     * @param html - The HTML content of the email (optional).
     * @returns A promise that resolves to a boolean indicating if the email was sent successfully, or an error if sending failed.
     * ``` EXAMPLE OF USAGE ```
     * EXAMPLE OF USAGE:
     * ```typescript
     * const smtp = new SmtpService();
     * const result = await smtp.sendGenericEmail('noreply@acdgbrasil.com.br','gaderaldo10@gmail.com','Teste do SMTP','Teste do SMTP');
     * if(!result) return res.status(500).send('error to send email');
     * return res.status(200).send('Email sent');
     * ```
     */
    async sendGenericEmail(from: string, to: string, subject: string, text: string | undefined, html?: string | undefined): Promise<Boolean | Error> {
        try {
            if(html === undefined || html === null) throw new Error('HTML content is required for sending emails');
            return await resendGenericEmail(from, to, subject,html!,undefined);
        } catch (e) {
            throw e;
        }
    }
}