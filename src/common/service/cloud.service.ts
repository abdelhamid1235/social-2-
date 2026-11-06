import { ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { APP_NAME, AWS_ACCESS_KEY_ID, AWS_BUCKET_NAME, AWS_REGION, AWS_SECRET_ACCESS_KEY } from "../../config"
import { StorageApproachEnum } from "../enum"
import { BadReaquestException } from "../exceptions"
import { randomUUID } from "node:crypto"
import { createReadStream } from "node:fs"



export class CloudService {

    private cloudService: S3Client
    constructor() {
        this.cloudService = new S3Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY
            }
        })
    }

    async uploadAsset({ storageApproach = StorageApproachEnum.MEMORY, Bucket = AWS_BUCKET_NAME, ACL = ObjectCannedACL.private, folders = "general", file, ContentType}: { storageApproach?: StorageApproachEnum, Bucket?: string, ACL?: ObjectCannedACL, folders?: string, file: Express.Multer.File, ContentType?: string | undefined}): Promise<string> {
        const command = new PutObjectCommand({
            Bucket,
            ACL,
            Key: `${APP_NAME}/${folders}/${randomUUID()}__${file.originalname}`,
            Body: storageApproach === StorageApproachEnum.MEMORY ? file.buffer : createReadStream(file.path),
            ContentType: file.mimetype || ContentType
        })

        console.log(command);
        if (!command.input.Key) {
            throw new BadReaquestException("Fail to upload this asset")
        }
        await this.cloudService.send(command)
        return command.input.Key

    }
}



export const cloudService = new CloudService()