import mongoose from 'mongoose';
import { ILocalCopy, LocalCopyModel } from './types';

export default function (schema: any) {
    schema.statics.create = function (model: any) {
        const localCopy: { modelName: string; model: string; data?: any } = {
            modelName: model.constructor.modelName,
            model: model._id,
        };

        localCopy.data = mongoose.model<ILocalCopy, LocalCopyModel>('localCopy').buildData(model);

        return localCopy.data ? localCopy : undefined;
    };
}
