import { EmailSubjectEnum } from './../../enum/email.enum';
import nodemailer from "nodemailer";
import { APP_EMAIL, APP_NAME, APP_PASSWORD } from "../../../config";
import { BadReaquestException } from "../../exceptions";

export const userEmailKey = ({email, subject}:{email:string , subject : EmailSubjectEnum}) : string=>{
    return `User::${email}::${subject}::OTP`
}
export const userEmailTrialsKey = ({email, subject}:{email:string , subject : EmailSubjectEnum}) : string=>{
    return `${userEmailKey({email , subject})}::Trials`
}


const transporter = nodemailer.createTransport({
    service:"gmail",
    auth: {
        user: APP_EMAIL,
        pass: APP_PASSWORD,
    },
});

export const sendEmail = async ({
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    attachments= []
}:{
    to?: string[],
    cc?: string[],
    bcc?: string[],
    subject: string,
    text?: string,
    html?: string,
    attachments? : any[]
})=>{
    try {
        if(!to?.length && !cc?.length && !bcc?.length){
            throw new BadReaquestException("Missing Email Recipients")
        }
        if(!html?.length && !text?.length && !attachments?.length){
            throw new BadReaquestException("Missing Email Content")
        }
        const info = await transporter.sendMail({
            from: `"${APP_NAME}" <${APP_EMAIL}>`,
            to,
            cc,
            bcc,
            subject,
            html,
            text,
            attachments
    });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
    console.error("Error while sending mail:", err);
    }
}