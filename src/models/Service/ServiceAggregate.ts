import { ILocalCopy, LocalCopyModel } from './../LocalCopy/types';
import mongoose, { Schema } from 'mongoose';
import { IService, ServiceModel } from './types';

export default function (ServiceSchema: Schema<IService, ServiceModel>) {
    ServiceSchema.statics.AggregateProject = function () {
        return {
            date: 1,
            artist: {
                $cond: {
                    if: { $isArray: ['$localCopies'] },
                    then: { $first: mongoose.model<ILocalCopy, LocalCopyModel>('localCopy').buildProject('user', { $eq: ['$$lcf.model', '$artist'] }) },
                    else: [],
                },
            },
            owner: {
                $cond: {
                    if: { $isArray: ['$localCopies'] },
                    then: { $first: mongoose.model<ILocalCopy, LocalCopyModel>('localCopy').buildProject('user', { $eq: ['$$lcf.model', '$owner'] }) },
                    else: [],
                },
            },
            studio: 1,
            comment: 1,
            status: 1,
            template: {
                $cond: {
                    if: { $isArray: ['$localCopies'] },
                    then: { $first: mongoose.model<ILocalCopy, LocalCopyModel>('localCopy').buildProject('serviceTemplate', { $eq: ['$$lcf.model', '$template'] }) },
                    else: [],
                },
            },
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
        return ['name', 'date', 'type', 'status', 'updatedAt'].includes(orderBy);
    };
    ServiceSchema.statics.AggregateSearch = function () {
        return ['name'];
    };
    ServiceSchema.statics.AggregateFilter = function () {
        return {
            date: 'date',
            artist: 'objectId',
            studio: 'objectId',
            template: 'objectId',
            createdAt: 'date',
            updatedAt: 'date',
            status: 'string',
            type: 'string',
            owner: 'objectId',
        };
    };
    ServiceSchema.statics.AggregateDefaultSort = function () {
        return { date: 1 };
    };

    return ServiceSchema;
}
