import mongoose, { Schema } from 'mongoose';
import model from './model';
import { StudioDetailsModel, StudioDetailsMethods, IStudioDetails } from './types';
import GlobalUtils from '../../../utils/GlobalUtils';
import StudioDetailsDefault from './StudioDetailsDefault';

const schema = new Schema<IStudioDetails, StudioDetailsModel, StudioDetailsMethods>(model, { autoCreate: false, _id: false });

GlobalUtils(schema);
StudioDetailsDefault(schema);

schema.methods.getModelName = function () {
    return 'studioDetails';
};

const StudioDetails = mongoose.model<IStudioDetails, StudioDetailsModel>('studioDetails', schema);

export default StudioDetails;
