import { Schema } from 'mongoose';
import { IStudio, StudioModel } from './types';

export default function (ServiceSchema: Schema<IStudio, StudioModel>) {
    ServiceSchema.statics.AggregateProject = function (params) {
        return {
            _id: 1,
            name: 1,
            users: 1,
            owner: 1,
            phone: 1,
            adminToken: 1,
            userToken: 1,
            createdAt: 1,
            updatedAt: 1,
            settings: 1,
        };
    };
    ServiceSchema.statics.HideFields = function () {
        return [];
    };
    ServiceSchema.statics.AggregateLookup = function () {
        return [];
    };
    ServiceSchema.statics.AggregateOrderBy = function (orderBy) {
        return ['name'].includes(orderBy);
    };
    ServiceSchema.statics.AggregateSearch = function () {
        return ['name'];
    };
    ServiceSchema.statics.AggregateFilter = function () {
        return {
            name: 'string',
        };
    };
    ServiceSchema.statics.AggregateDefaultSort = function () {
        return { name: 1 };
    };
    return ServiceSchema;
}
