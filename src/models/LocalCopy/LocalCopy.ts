import mongoose from 'mongoose';
import GlobalUtils from '../../utils/GlobalUtils';
import LocalCopyDefault from './LocalCopyDefault';
import LocalCopyUtils from './LocalCopyUtils';
import model from './model';
import { ILocalCopy, LocalCopyMethods, LocalCopyModel } from './types';

const schema = new mongoose.Schema<ILocalCopy, LocalCopyModel, LocalCopyMethods>(model, { _id: false, autoCreate: false });

GlobalUtils(schema);
LocalCopyUtils(schema);
LocalCopyDefault(schema);

schema.methods.getModelName = function () {
    return 'localCopy';
};
const LocalCopy = mongoose.model<ILocalCopy, LocalCopyModel>('localCopy', schema);

export default LocalCopy;
