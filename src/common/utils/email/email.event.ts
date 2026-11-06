import {EventEmitter} from 'node:events'
import { sendEmail } from './send.email';
import { verifyEmailTemplate } from './email.templates';
import { EmailSubjectEnum } from '../../enum';


export const emailEvent = new EventEmitter();

emailEvent.on("sendEmail" , async({recipients , subject , data}:{
    recipients : {to?:string[] , cc?:string[], bcc?: string[]} ,
    subject: EmailSubjectEnum , 
    data : any
})=>{
    try {
        await sendEmail({
            ...recipients,
            subject,
            html:verifyEmailTemplate({
                subject , 
                code:data.code , 
                title:data.title ?? subject ,
                userName : data.userName
            })
        })
    } catch (error) {
        console.log(error);
    }
})