import { Model, ObjectId } from 'mongoose';
import { Request } from '../../common';
import { IPicture } from '../others/Pictures/types';

export interface IStudio {
    _id: string;
    users: ObjectId[];
    owner: ObjectId;
    name: string;
    phone: string;
    adminToken: string;
    userToken: string;
    createdAt: Date;
    updatedAt: Date;
    pictures: IPicture[];
}

export interface StudioMethods {
    edit: (req: Request) => Promise<StudioModel>;
    delete: () => void;
    deletePicture: (req: Request, pictureId: string) => Promise<void>;
    postCreated: () => Promise<StudioModel>;
    generateJSON: () => Promise<IStudio>;
}

export interface StudioModel extends Model<IStudio, Record<string, unknown>, StudioMethods> {
    createStudio: (req: Request) => Promise<StudioModel>;
    createModel: (data: any) => Promise<StudioModel>;
    generateToken: (id: string, admin?: boolean) => Promise<string>;
    generateJSON: () => Promise<IStudio>;
    isValidTokenType: (type: 'adminToken' | 'userToken') => Promise<boolean>;
}
