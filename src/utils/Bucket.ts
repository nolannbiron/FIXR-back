import { GridFSBucket, MongoClient, Db } from 'mongodb';
import database from '../config/database';
import aws from 'aws-sdk';
import { S3Client } from '@aws-sdk/client-s3';

aws.config.update({
    // Your SECRET ACCESS KEY from AWS should go here,
    // Never share it!
    // Setup Env Variable, e.g: process.env.SECRET_ACCESS_KEY
    secretAccessKey: process.env.S3_SECRET,
    // Not working key, Your ACCESS KEY ID from AWS should go here,
    // Never share it!
    // Setup Env Variable, e.g: process.env.ACCESS_KEY_ID
    accessKeyId: process.env.S3_ACCESS_KEY,
    region: 'eu-west-3', // region of your bucket
});

export const s3 = new S3Client({ region: 'eu-west-3', credentials: { accessKeyId: process.env.S3_ACCESS_KEY ?? '', secretAccessKey: process.env.S3_SECRET ?? '' } });

export const getBucket = (bucketName: string) => {
    const client = new MongoClient(database.fullUrl ?? '');
    const db = new Db(client, 'fixr');
    const bucket = new GridFSBucket(db, { bucketName });
    return bucket;
};

// export const uploadToS3 = (bucketName: string, file: any, fileName: string) => {
