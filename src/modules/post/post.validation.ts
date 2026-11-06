
import { z } from "zod";
import { LanguageEnum } from "../../common/enum";
import { generaValidationFields } from "../../common/utils";

export const createPost = (lang: LanguageEnum) => {
    return z.object({
        body: z.strictObject({
            content: z.string()
                .min(2)
                .max(50000)
                .optional()
        }),
        files: z.array(
            generaValidationFields.file(lang)
        ).max(3).optional()
    }).superRefine((data, ctx) => {
        if (!data.body.content && !data.files?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["body", "content"],
                message: lang === LanguageEnum.AR
                    ? "لازم يكون فيه محتوى أو صورة"
                    : "Post must contain content or attachments"
            });
        }
    });
};

export const getPost = (lang: LanguageEnum) => {
    return z.object({
        params: z.strictObject({
            postId: generaValidationFields.id(lang)
        })
    });
};

export const updatePost = (lang: LanguageEnum) => {
    return z.object({
        params: z.strictObject({
            postId: generaValidationFields.id(lang)
        }),
        body: z.strictObject({
            content: z.string().min(2).max(50000).optional()
        }).refine(
            data => Object.keys(data).length > 0,
            {
                message: lang === LanguageEnum.AR
                    ? "يجب إرسال بيانات للتعديل"
                    : "At least one field is required"
            }
        )
    });
};
