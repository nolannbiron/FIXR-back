import { GridFSBucket, MongoClient, Db } from 'mongodb';
import database from '../config/database';

export const getBucket = (bucketName: string) => {
    const client = new MongoClient(database.fullUrl ?? '');
    const db = new Db(client, 'fixr');
    const bucket = new GridFSBucket(db, { bucketName });
    return bucket;
};
