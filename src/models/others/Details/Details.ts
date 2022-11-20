import mongoose, { Schema } from 'mongoose';
import model from './model';
import { DetailsModel, DetailsMethods, IDetails } from './types';
import GlobalUtils from '../../../utils/GlobalUtils';
import DetailsDefault from './DetailsDefault';
import DetailsUtils from './DetailsUtils';

const schema = new Schema<IDetails, DetailsModel, DetailsMethods>(model, { autoCreate: false, id: false });

GlobalUtils(schema);
DetailsDefault(schema);
DetailsUtils(schema);

schema.methods.getModelName = function () {
    return 'details';
};

const Details = mongoose.model<IDetails, DetailsModel>('details', schema);

export default Details;
