import { Model, ObjectId } from 'mongoose';
import { Request } from '../../common';
import { Socials } from '../others/Socials/types';

export interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    profile: {
        permissionLevel: number;
    };
    studios: ObjectId[] | string[];
    comment: string;
    socials?: Socials;
    createdAt?: Date;
    updatedAt?: Date;
    _isNew?: boolean;
    __FIXR_DATA?: any;
}

export interface UserMethods {
    edit: (req: Request) => Promise<UserModel>;
    postCreated: () => Promise<UserModel>;
    generateJSON: () => Omit<IUser, 'password'>;
    delete: (id: string) => Promise<UserModel>;
    isOwner: (id: string) => boolean;
}

export interface UserModel extends Model<IUser, Record<string, unknown>, UserMethods> {
    createUser: (data: IUser) => Promise<UserModel>;
    createModel: (data: IUser) => Promise<UserModel>;
    generateJSON: () => Omit<IUser, 'password'>;
    serviceArtistQuery: (arr: any[]) => Record<string, unknown>;
}
