import crypto from 'crypto';
import { ENC_KEY, IV_LENGTH } from '../../config.js';

export const encrypt = async (plainText : string) : Promise<string> => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, iv);
    let encryptedData = cipher.update(plainText, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');
    return `${iv.toString('hex')}:${encryptedData}`;
}

export const decrypt = async (encryptedData : string): Promise<string> => {
    let [iv, encryptedText] = encryptedData.split(":") as [string | Buffer , string]; // []
    iv = Buffer.from(iv as string, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, iv);
    let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
    decryptedData += decipher.final('utf-8');
    return decryptedData;
}
