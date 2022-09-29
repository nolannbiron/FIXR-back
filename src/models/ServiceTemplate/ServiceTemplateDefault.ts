import mongoose, { Schema } from 'mongoose';
import { Request } from '../../common';
import ModelUtils from '../../utils/ModelsUtils';
import Service from './ServiceTemplate';
import { IServiceTemplate, ServiceTemplateModel } from './types';
import LocalCopy from '../LocalCopy/LocalCopy';

export default function (ServiceTemplateSchema: Schema<IServiceTemplate, ServiceTemplateModel>) {
    ServiceTemplateSchema.pre('validate', async function (next) {
        // const service = this
        next();
    });
    ServiceTemplateSchema.pre('save', async function (next) {
        const service = this as any;

        if (service.servicePreSave) await service.servicePreSave();

        next();
    });

    ServiceTemplateSchema.post('save', async function () {
        const service = this;

        if (!service.isNew) {
            LocalCopy.updateEveryContainers(service, 'update');
        }
    });

    /** ----------------------- Create ----------------------- */
    ServiceTemplateSchema.statics.createServiceTemplate = async function (data: Partial<IServiceTemplate> & { studioId: string; artistId: string }) {
        /** Handle req, used by routers */

        return mongoose.model<IServiceTemplate, ServiceTemplateModel>('serviceTemplate').createModel({
            name: data.name ? data.name : 'New Service',
            studio: data.studioId,
            price: data.price ? data.price : 0,
            type: data.type ? data.type : 'physical',
        });
    };
    ServiceTemplateSchema.statics.createModel = async function (data: IServiceTemplate) {
        /** Only create model, intern used only */
        const service = await ModelUtils.createHandler(new Service(data));
        /** Service post created */
        return service;
    };

    /** ----------------------- Edit ----------------------- */
    ServiceTemplateSchema.methods.edit = async function (req: Request) {
        const { price, name, type } = req.body;
        const service = this;

        service.editValue(req, price, 'price');
        service.editValue(req, name, 'name');
        service.editValue(req, type, 'type');

        await service.save();
    };

    /** ----------------------- Delete ----------------------- */
    ServiceTemplateSchema.methods.delete = async function () {
        const service = this;

        if (service._isDeleted) return;
        service._isDeleted = true;

        await service.save();

        /** Delete service */
        // if (!(await mongoose.model('serviceTemplate').findOneAndDelete({ _id: service._id }))) throw { message: 'Delete failed' };
    };
}
