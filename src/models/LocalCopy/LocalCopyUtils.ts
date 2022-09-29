import mongoose, { Schema } from 'mongoose';
import { IServiceTemplate } from '../ServiceTemplate/types';
import { IUser } from '../User/types';
import { ILocalCopy, LocalCopyModel } from './types';

const types = [
    {
        mainModel: 'service',
        copies: [
            {
                type: 'user',
            },
            {
                type: 'serviceTemplate',
            },
        ],
    },
];

export default function (schema: Schema<ILocalCopy, LocalCopyModel>) {
    schema.methods.generateJSON = async function () {
        const localCopy = this;

        return {
            modelName: localCopy.modelName,
            model: localCopy.model,
            data: localCopy.data,
        };
    };

    /** User */
    schema.statics.buildArtistModel = function (model: IUser) {
        return {
            id: model._id,
            firstName: model.firstName,
            lastName: model.lastName,
            username: model.username,
        };
    };

    schema.statics.buildTemplateModel = function (model: IServiceTemplate & { _id: string }) {
        return {
            id: model._id,
            name: model.name,
            price: model.price,
            type: model.type,
        };
    };

    schema.statics.buildData = function (model: any) {
        try {
            if (model?.constructor?.modelName === 'user') {
                return mongoose.model<ILocalCopy, LocalCopyModel>('localCopy').buildArtistModel(model);
            } else if (model?.constructor?.modelName === 'serviceTemplate') {
                return mongoose.model<ILocalCopy, LocalCopyModel>('localCopy').buildTemplateModel(model);
            }
        } catch (error) {
            console.log(error);
            // __error('localCopy.buildData', error);
        }
    };

    schema.statics.updateEveryContainers = async function (model: any, action: string) {
        console.log(model?.constructor?.modelName);
        await Promise.all(
            types.map(async (elem) => {
                if (!Array.isArray(elem.copies) || !elem.copies.some((lc) => lc.type === model?.constructor?.modelName)) return undefined;
                if (action === 'update')
                    return await mongoose.model(elem.mainModel).updateMany(
                        { 'localCopies.model': model._id },
                        {
                            $set: { 'localCopies.$.data': mongoose.model<ILocalCopy, LocalCopyModel>('localCopy').buildData(model) },
                        },
                    );
                else if (action === 'delete')
                    return await mongoose.model(elem.mainModel).updateMany(
                        { 'localCopies.model': model._id },
                        {
                            $pull: { localCopies: { model: model._id.toString() } },
                        },
                    );
            }),
        );
    };

    schema.statics.buildProject = function (modelNameQuery: string, modelQuery: Record<string, any>) {
        return {
            $map: {
                input: {
                    $filter: {
                        input: '$localCopies',
                        cond: { $and: [{ $eq: ['$$lcf.modelName', modelNameQuery] }, modelQuery] },
                        as: 'lcf',
                    },
                },
                as: 'lcm',
                in: { $getField: { field: 'data', input: '$$lcm' } },
            },
        };
    };
}
