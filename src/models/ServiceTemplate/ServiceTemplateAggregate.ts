import { Schema } from 'mongoose';
import { IServiceTemplate, ServiceTemplateModel } from './types';

export default function (ServiceSchema: Schema<IServiceTemplate, ServiceTemplateModel>) {
    ServiceSchema.statics.AggregateProject = function () {
        return {
            studio: 1,
            name: 1,
            price: 1,
            type: 1,
        };
    };
    ServiceSchema.statics.HideFields = function () {
        return [];
    };
    ServiceSchema.statics.AggregateLookup = function () {
        return [];
    };
    ServiceSchema.statics.AggregateOrderBy = function (orderBy) {
        return ['name', 'price', 'type'].includes(orderBy);
    };
    ServiceSchema.statics.AggregateSearch = function () {
        return ['name'];
    };
    ServiceSchema.statics.AggregateFilter = function () {
        return {
            name: 'string',
            type: 'string',
            price: 'number',
            studio: 'objectId',
        };
    };
    ServiceSchema.statics.AggregateDefaultSort = function () {
        return { name: 1 };
    };

    return ServiceSchema;
}
