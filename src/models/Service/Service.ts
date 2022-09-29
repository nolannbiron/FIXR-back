import mongoose, { Schema } from 'mongoose';
import GlobalUtils from '../../utils/GlobalUtils';
import model from './model';
import ServiceAggregate from './ServiceAggregate';
import ServiceDefault from './ServiceDefault';
import ServiceUtils from './ServiceUtils';
import { IService, ServiceMethods, ServiceModel } from './types';

const schema = new Schema<IService, ServiceModel, ServiceMethods>(model, { timestamps: true });

schema.methods.getModelName = function () {
    return 'service';
};

GlobalUtils(schema);
ServiceUtils(schema);
ServiceAggregate(schema);
ServiceDefault(schema);

const Service = mongoose.model<IService, ServiceModel>('service', schema);

export default Service;
