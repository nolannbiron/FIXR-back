import mongoose, { Schema } from 'mongoose';
import GlobalUtils from '../../utils/GlobalUtils';
import model from './model';
import ServiceTemplateAggregate from './ServiceTemplateAggregate';
import ServiceTemplateDefault from './ServiceTemplateDefault';
import ServiceTemplateUtils from './ServiceTemplateUtils';
import { IServiceTemplate, ServiceTemplateModel, ServiceTemplateMethods } from './types';

const schema = new Schema<IServiceTemplate, ServiceTemplateModel, ServiceTemplateMethods>(model, { timestamps: true });

GlobalUtils(schema);
ServiceTemplateAggregate(schema);
ServiceTemplateUtils(schema);
ServiceTemplateDefault(schema);

schema.methods.getModelName = function () {
    return 'serviceTemplate';
};

const ServiceTemplate = mongoose.model<IServiceTemplate, ServiceTemplateModel>('serviceTemplate', schema);

export default ServiceTemplate;
