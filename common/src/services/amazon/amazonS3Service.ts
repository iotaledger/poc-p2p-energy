import * as aws from "aws-sdk";
import { ObjectCannedACL } from "aws-sdk/clients/s3";
import { IAWSS3Configuration } from "../../models/config/IAWSS3Configuration";
import { ILoggingService } from "../../models/services/ILoggingService";

/**
 * Class to communicate with amazon s3.
 */
export class AmazonS3Service {
    /**
     * S3 Configuration.
     */
    private readonly _config: IAWSS3Configuration;

    /**
     * Full bucket name.
     */
    private readonly _fullBucketName: string;

    /**
     * Create a new instance of AmazonS3Service.
     * @param config The configuration for the s3 service.
     * @param bucketName The name of the bucket to use.
     */
    constructor(config: IAWSS3Configuration, bucketName: string) {
        this._config = config;
        this._fullBucketName = `${config.bucketPrefix}${bucketName}`;
    }

    /**
     * Create the bucket on S3.
     * @param loggingService Log output.
     */
    public async createBucket(loggingService: ILoggingService): Promise<void> {
        loggingService.log("s3", `Creating Bucket' ${this._fullBucketName}'`);

        try {
            const s3 = this.createClient();

            await s3.createBucket({
                Bucket: this._fullBucketName,
                CreateBucketConfiguration: {
                    LocationConstraint: this._config.region
                }
            }).promise();

            loggingService.log("s3", `Bucket '${this._fullBucketName}' Created Successfully`);
        } catch (err) {
            if (err.code === "BucketAlreadyOwnedByYou") {
                loggingService.log("s3", `Bucket '${this._fullBucketName}' Already exists`);
            } else {
                loggingService.error("s3", `Bucket '${this._fullBucketName}' Failed`, err);
            }
        }
    }

    /**
     * Get an item from the s3 bucket.
     * @param itemName The name of the item to get.
     * @returns The item if it exists, undefined if it doesn't or could throw an error.
     */
    public async getItem<T>(itemName: string): Promise<T> {
        const s3 = this.createClient();

        try {
            const bucketData = await s3.getObject({
                Bucket: this._fullBucketName,
                Key: itemName
            }).promise();
            return JSON.parse(bucketData.Body.toString());
        } catch (err) {
            if (err.code === "NoSuchKey") {
                return undefined;
            } else {
                throw (err);
            }
        }
    }

    /**
     * Get an item from the s3 bucket.
     * @param itemName The name of the item to get.
     * @returns The item if it exists, undefined if it doesn't or could throw an error.
     */
    public async getString(itemName: string): Promise<string> {
        const s3 = this.createClient();

        try {
            const bucketData = await s3.getObject({
                Bucket: this._fullBucketName,
                Key: itemName
            }).promise();
            return bucketData.Body.toString();
        } catch (err) {
            if (err.code === "NoSuchKey") {
                return undefined;
            } else {
                throw (err);
            }
        }
    }

    /**
     * Get an item from the s3 bucket.
     * @param itemName The name of the item to get.
     * @returns The item if it exists, undefined if it doesn't or could throw an error.
     */
    public async getBinary(itemName: string): Promise<Buffer> {
        const s3 = this.createClient();

        try {
            const bucketData = await s3.getObject({
                Bucket: this._fullBucketName,
                Key: itemName
            }).promise();
            return Buffer.from(bucketData.Body.toString());
        } catch (err) {
            if (err.code === "NoSuchKey") {
                return undefined;
            } else {
                throw (err);
            }
        }
    }

    /**
     * Put an item into the s3 bucket.
     * @param itemName The name of the item to put.
     * @param data The data to put for the item.
     * @param acl The ACL for storing the file.
     * @returns Promise.
     */
    public async putItem<T>(itemName: string, data: T, acl?: ObjectCannedACL): Promise<void> {
        const s3 = this.createClient();

        const json = JSON.stringify(data);
        return s3.putObject({
            Bucket: this._fullBucketName,
            Key: itemName,
            Body: json,
            ACL: acl
        }).promise().then(() => undefined);
    }

    /**
     * Put a string into the s3 bucket.
     * @param itemName The name of the item to put.
     * @param data The data to put for the item.
     * @param acl The ACL for storing the file.
     * @returns Promise.
     */
    public async putString(itemName: string, data: string, acl?: ObjectCannedACL): Promise<void> {
        const s3 = this.createClient();

        return s3.putObject({
            Bucket: this._fullBucketName,
            Key: itemName,
            Body: data,
            ACL: acl
        }).promise().then(() => undefined);
    }

    /**
     * Put binary data into the s3 bucket.
     * @param itemName The name of the item to put.
     * @param data The data to put for the item.
     * @param acl The ACL for storing the file.
     * @returns Promise.
     */
    public async putBinary(itemName: string, data: Buffer, acl?: ObjectCannedACL): Promise<void> {
        const s3 = this.createClient();

        return s3.putObject({
            Bucket: this._fullBucketName,
            Key: itemName,
            Body: data,
            ACL: acl
        }).promise().then(() => undefined);
    }

    /**
     * Delete an item from the bucket.
     * @param itemName The name of the item to delete.
     */
    public async deleteItem(itemName: string): Promise<void> {
        const s3 = this.createClient();

        if (itemName.endsWith("/")) {
            let finished = false;
            do {
                const listedObjects = await s3.listObjectsV2(
                    {
                        Bucket: this._fullBucketName,
                        Prefix: itemName
                    }).promise();

                if (listedObjects.Contents.length > 0) {
                    await s3.deleteObjects({
                        Bucket: this._fullBucketName,
                        Delete: { Objects: listedObjects.Contents.map(item => ({ Key: item.Key })) }
                    }).promise();

                    finished = !listedObjects.IsTruncated;
                } else {
                    finished = true;
                }
            }
            while (!finished);
        } else {
            await s3.deleteObject({
                Bucket: this._fullBucketName,
                Key: itemName
            }).promise();
        }
    }

    /**
     * Does an item exist.
     * @param itemName The name of the item to check for existence.
     * @returns True if the item exists.
     */
    public async existsItem(itemName: string): Promise<boolean> {
        const s3 = this.createClient();

        try {
            await s3.headObject({
                Bucket: this._fullBucketName,
                Key: itemName
            }).promise();

            return true;
        } catch (err) {
            if (err.statusCode === 404 || err.code === "NoSuchKey") {
                return false;
            } else {
                throw (err);
            }
        }
    }

    /**
     * List all the items prefixed with the specified name.
     * @param prefix The prefix of the items to get.
     * @returns All the items with the provided prefix.
     */
    public async list(prefix: string): Promise<string[]> {
        const keys = [];

        const s3 = this.createClient();

        let finished = false;
        do {
            const listedObjects = await s3.listObjectsV2(
                {
                    Bucket: this._fullBucketName,
                    Prefix: prefix
                }).promise();

            if (listedObjects.Contents.length > 0) {
                for (let i = 0; i < listedObjects.Contents.length; i++) {
                    if (listedObjects.Contents[i].Size > 0) {
                        keys.push(listedObjects.Contents[i].Key);
                    }
                }

                finished = !listedObjects.IsTruncated;
            } else {
                finished = true;
            }
        }
        while (!finished);

        return keys;
    }

    /**
     * Get all the items with the specified keys.
     * @param keys The prefix of the items to get.
     * @returns All the items with the provided prefix.
     */
    public async getAll<T>(keys: string[]): Promise<T[]> {
        const items: T[] = [];

        const s3 = this.createClient();

        for (let i = 0; i < keys.length; i++) {
            const bucketData = await s3.getObject({
                Bucket: this._fullBucketName,
                Key: keys[i]
            }).promise();

            try {
                items.push(JSON.parse(bucketData.Body.toString()));
            } catch (err) {
                items.push(undefined);
            }
        }

        return items;
    }

    /**
     * Create and set the configuration for s3.
     * @param config The configuration to use for connection.
     * @returns Client instance.
     */
    private createClient(): aws.S3 {
        const s3Config = new aws.Config({
            accessKeyId: this._config.accessKeyId,
            secretAccessKey: this._config.secretAccessKey,
            region: this._config.region
        });

        return new aws.S3(s3Config);
    }
}
