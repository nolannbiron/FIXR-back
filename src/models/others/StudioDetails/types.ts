import { Model } from 'mongoose';

export interface IStudioDetails {
    rules: string[];
    extras: string[];
}

export type StudioDetails = Omit<IStudioDetails, '_id'> & { _id?: string };

export interface StudioDetailsMethods {
    edit: (req: Request) => Promise<IStudioDetails>;
}

export type StudioDetailsModel = Model<IStudioDetails, Record<string, unknown>, StudioDetailsMethods>;
