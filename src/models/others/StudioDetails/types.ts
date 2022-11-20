import { Model } from 'mongoose';
import { IDetails } from '../Details/types';

export interface IStudioDetails {
    rules: IDetails[];
    extras: IDetails[];
}

export type StudioDetails = Omit<IStudioDetails, '_id'> & { _id?: string };

export interface StudioDetailsMethods {
    edit: (req: Request) => Promise<IStudioDetails>;
}

export type StudioDetailsModel = Model<IStudioDetails, Record<string, unknown>, StudioDetailsMethods>;
