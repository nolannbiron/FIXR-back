import { Schema } from 'mongoose';
import { IUser, UserModel } from './types';

export default function (UserSchema: Schema<IUser, UserModel>) {
    UserSchema.statics.AggregateProject = function () {
        return {
            firstName: 1,
            lastName: 1,
            email: 1,
            phone: 1,
            username: 1,
            profile: 1,
        };
    };
    UserSchema.statics.HideFields = function () {
        return [];
    };
    UserSchema.statics.AggregateLookup = function () {
        return [];
    };
    UserSchema.statics.AggregateOrderBy = function (orderBy) {
        return ['lastName'].includes(orderBy);
    };
    UserSchema.statics.AggregateSearch = function () {
        return ['firstName', 'lastName', 'email', 'phone', 'username'];
    };
    UserSchema.statics.AggregateFilter = function () {
        return {
            firstName: 'string',
            lastName: 'string',
            email: 'string',
            phone: 'string',
            username: 'string',
            'profile.permissionLevel': 'number',
        };
    };
    UserSchema.statics.AggregateDefaultSort = function () {
        return { lastName: 1 };
    };

    return UserSchema;
}
