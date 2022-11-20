import { Model } from 'mongoose';

export interface IDetails {
    _id: string;
    data: string;
}

export type Details = Omit<IDetails, '_id'> & { _id?: string };

export interface DetailsMethods {
    edit: (req: Request) => Promise<IDetails>;
    generateJSON: () => Promise<IDetails>;
}

export interface DetailsModel extends Model<IDetails, Record<string, unknown>, DetailsMethods> {
    createModel: (req: Request) => Promise<IDetails>;
}
