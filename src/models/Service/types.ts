import { Model, ObjectId } from 'mongoose';
import { Request } from '../../common';

export interface IService {
    date?: Date;
    artist: string | ObjectId;
    owner?: string | ObjectId;
    studio: string | ObjectId;
    comment: string;
    status: 'pending' | 'done' | 'incoming';
    template: string | ObjectId;
    type: 'physical' | 'digital';
    files?: string[] | ObjectId[];
}

export interface ServiceMethods {
    edit: (req: Request) => Promise<ServiceModel>;
    delete: () => void;
    generateJSON: () => Promise<IService>;
    populateAsync: (path: string) => Promise<ServiceModel>;
    updateLocalCopies: (modelName: string, models: any[]) => void;
    serviceCanAccess: (user: any) => Promise<boolean>;
}

export interface ServiceModel extends Model<IService, Record<string, unknown>, ServiceMethods> {
    createService: (req: Request) => Promise<ServiceModel>;
    createModel: (data: Partial<IService>) => Promise<ServiceModel>;
    generateJSON: () => Promise<IService>;
    populateAsync: (path: string) => Promise<ServiceModel>;
}
