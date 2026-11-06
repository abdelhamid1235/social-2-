import {z} from "zod";
import { confirmEmail, login, resentconfirmEmail, resetPassword, signup } from "../authentication.validation";



export type SignupDto = z.infer<ReturnType<typeof signup>>;
export type ConfirmEmailDto = z.infer<ReturnType<typeof confirmEmail>>["body"];
export type ResentconfirmEmailDto = z.infer<ReturnType<typeof resentconfirmEmail>>["body"];
export type ResetPasswordDto = z.infer<ReturnType<typeof resetPassword>>["body"];
export type LoginDto = z.infer<ReturnType<typeof login>>["body"];