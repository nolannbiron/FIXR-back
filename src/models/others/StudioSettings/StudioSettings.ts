import mongoose, { Schema } from 'mongoose';
import model from './model';
import { IStudioSettings } from './types';
import GlobalUtils from '../../../utils/GlobalUtils';

const schema = new Schema<IStudioSettings>(model, { timestamps: true, autoCreate: false });

GlobalUtils(schema);

schema.methods.getModelName = function () {
    return 'studioSettings';
};

const StudioSettings = mongoose.model<IStudioSettings>('studioSettings', schema);

export default StudioSettings;
