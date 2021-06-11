/**
 * Definition of AWS S3 configuration.
 */
export interface IAWSS3Configuration {
    /**
     * The region for the AWS S3.
     */
    region: string;
    /**
     * The AWS access key.
     */
    accessKeyId: string;
    /**
     * The AWS secret access key.
     */
    secretAccessKey: string;
    /**
     * Bucket prefix for storage.
     */
    bucketPrefix: string;
}
