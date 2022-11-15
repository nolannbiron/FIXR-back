import mongoose, { Schema } from 'mongoose';
import model from './model';
import { IPicture } from './types';
import GlobalUtils from '../../../utils/GlobalUtils';

const schema = new Schema<IPicture>(model, { timestamps: true, autoCreate: false });

GlobalUtils(schema);

schema.methods.getModelName = function () {
    return 'pictures';
};

const Pictures = mongoose.model<IPicture>('pictures', schema);

export default Pictures;
