import { UserModel } from './../User/types';
import { Model, ObjectId } from 'mongoose';
import { Request } from '../../common';
import { IUser } from '../User/types';
// import { Comment } from '../others/Comments/types';

export interface ILocalCopy {
    modelName: string;
    model: ObjectId;
    data: any;
}

export interface LocalCopyMethods {
    edit: (req: Request) => Promise<LocalCopyModel>;
    delete: () => void;
    generateJSON: () => Promise<ILocalCopy>;
    populateAsync: (path: string) => Promise<LocalCopyModel>;
}

export interface LocalCopyModel extends Model<ILocalCopy, Record<string, unknown>, LocalCopyMethods> {
    createLocalCopy: (data: Partial<ILocalCopy>) => ILocalCopy;
    buildData: (model: IUser) => any;
    updateEveryContainers: (model: any, action: string) => Promise<any>;
    buildArtistModel: (model: IUser) => any;
    buildProject: (modelNameQuery: string, modelQuery: Record<string, any>) => any;
    buildTemplateModel: (model: any) => any;
}
