import mongoose, { Schema } from 'mongoose';
import model from './model';
import StudioDefault from './StudioDefault';
import { IStudio, StudioMethods, StudioModel } from './types';
import StudioUtils from './StudioUtils';
import GlobalUtils from '../../utils/GlobalUtils';
import StudioAggregate from './StudioAggregate';

const schema = new Schema<IStudio, StudioModel, StudioMethods>(model, { timestamps: true });

GlobalUtils(schema);
StudioAggregate(schema);
StudioUtils(schema);
StudioDefault(schema);

schema.methods.getModelName = function () {
    return 'studio';
};

const Studio = mongoose.model<IStudio, StudioModel>('studio', schema);

export default Studio;
