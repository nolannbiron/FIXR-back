import { Request as BaseRequest } from 'express';
import { Document, Types } from 'mongoose';
import { IUser, UserMethods } from './models/User/types';

declare type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;
declare type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
declare type PartialOn<T, K extends keyof T> = Omit<T, K> & { [P in K]: Partial<T[P]> };
declare type NullableOn<T, K extends keyof T> = Omit<T, K> & { [P in K]: T[P] | null };
declare type DeepPartial<T> = Partial<{ [P in keyof T]: DeepPartial<T[P]> }>;

export type Request = BaseRequest & {
    authPath?: 'user' | 'admin';
    authType?: string;
    user?: Document<unknown, any, IUser> & IUser & Required<{ _id: string | Types.ObjectId }> & UserMethods;
    authToken?: { id: string; data: string };
};
