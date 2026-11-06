import { EmailSubjectEnum } from "../../enum/index.js";

const dateYear = new Date().getFullYear()

const Templates = {
    [EmailSubjectEnum.confirm_Email] :(data : any)=>{
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            font-family: Arial, Helvetica, sans-serif;
        ">

            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td align="center" style="padding: 40px 15px;">

                        <table width="600" cellpadding="0" cellspacing="0" border="0"
                            style="
                                max-width: 600px;
                                width: 100%;
                                background-color: #ffffff;
                                border-radius: 12px;
                                overflow: hidden;
                            ">

                            <!-- Header -->
                            <tr>
                                <td align="center" style="
                                    background-color: #0d6efd;
                                    padding: 30px;
                                    color: #ffffff;
                                ">
                                    <h1 style="
                                        margin: 0;
                                        font-size: 28px;
                                    ">
                                        ${data.title}
                                    </h1>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 35px; color: #333333;">

                                    <h2 style="
                                        margin-top: 0;
                                        font-size: 22px;
                                    ">
                                        Hello ${data.userName} 👋
                                    </h2>

                                    <p style="
                                        font-size: 16px;
                                        line-height: 1.6;
                                        color: #555555;
                                    ">
                                        Thank you for creating an account with us.
                                        Please verify your email address using the
                                        verification code below.
                                    </p>

                                    <!-- Verification Code -->
                                    <div style="
                                        margin: 30px 0;
                                        text-align: center;
                                    ">
                                        <div style="
                                            display: inline-block;
                                            padding: 18px 35px;
                                            background-color: #f1f5ff;
                                            border: 1px solid #d6e2ff;
                                            border-radius: 8px;
                                            font-size: 32px;
                                            font-weight: bold;
                                            letter-spacing: 8px;
                                            color: #0d6efd;
                                        ">
                                            ${data.code}
                                        </div>
                                    </div>

                                    <p style="
                                        font-size: 14px;
                                        line-height: 1.6;
                                        color: #777777;
                                    ">
                                        This verification code will expire soon.
                                        If you did not create an account, you can
                                        safely ignore this email.
                                    </p>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td align="center" style="
                                    padding: 20px;
                                    background-color: #f8f9fa;
                                    color: #888888;
                                    font-size: 13px;
                                ">
                                    © ${dateYear} Your App.
                                    All rights reserved.
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
    `;
    },
    [EmailSubjectEnum.forget_password] :(data : any)=>{
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            font-family: Arial, Helvetica, sans-serif;
        ">

            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td align="center" style="padding: 40px 15px;">

                        <table width="600" cellpadding="0" cellspacing="0" border="0"
                            style="
                                max-width: 600px;
                                width: 100%;
                                background-color: #ffffff;
                                border-radius: 12px;
                                overflow: hidden;
                            ">

                            <!-- Header -->
                            <tr>
                                <td align="center" style="
                                    background-color: #0d6efd;
                                    padding: 30px;
                                    color: #ffffff;
                                ">
                                    <h1 style="
                                        margin: 0;
                                        font-size: 28px;
                                    ">
                                        ${data.title}
                                    </h1>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 35px; color: #333333;">

                                    <h2 style="
                                        margin-top: 0;
                                        font-size: 22px;
                                    ">
                                        Hello ${data.userName} 👋
                                    </h2>

                                    <p style="
                                        font-size: 16px;
                                        line-height: 1.6;
                                        color: #555555;
                                    ">
                                        We received a request to reset your password. Please use the verification code below to continue
                                    </p>

                                    <!-- Verification Code -->
                                    <div style="
                                        margin: 30px 0;
                                        text-align: center;
                                    ">
                                        <div style="
                                            display: inline-block;
                                            padding: 18px 35px;
                                            background-color: #f1f5ff;
                                            border: 1px solid #d6e2ff;
                                            border-radius: 8px;
                                            font-size: 32px;
                                            font-weight: bold;
                                            letter-spacing: 8px;
                                            color: #0d6efd;
                                        ">
                                            ${data.code}
                                        </div>
                                    </div>

                                    <p style="
                                        font-size: 14px;
                                        line-height: 1.6;
                                        color: #777777;
                                    ">
                                        This code will expire shortly. If you did not request a password reset, please ignore this email
                                    </p>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td align="center" style="
                                    padding: 20px;
                                    background-color: #f8f9fa;
                                    color: #888888;
                                    font-size: 13px;
                                ">
                                    © ${dateYear} Your App.
                                    All rights reserved.
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
    `;
    }
}


export const verifyEmailTemplate = <T = any>(data: T & {subject :EmailSubjectEnum}  ) => {
    return Templates[data.subject](data);
};
