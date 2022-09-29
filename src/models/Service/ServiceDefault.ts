import mongoose, { ObjectId, Schema } from 'mongoose';
import { Request } from '../../common';
import ModelUtils from '../../utils/ModelsUtils';
import { IServiceTemplate, ServiceTemplateModel } from '../ServiceTemplate/types';
import Service from './Service';
import { IService, ServiceModel } from './types';

export default function (ServiceSchema: Schema<IService, ServiceModel>) {
    ServiceSchema.pre('validate', async function (next) {
        // const service = this
        next();
    });
    ServiceSchema.pre('save', async function (next) {
        const service = this as any;

        // if (service.servicePreSave) await service.servicePreSave();

        next();
    });
    /** ----------------------- Create ----------------------- */
    ServiceSchema.statics.createService = async function (req: Request) {
        /** Handle req, used by routers */
        const data = req.body;

        const template = await mongoose.model<IServiceTemplate, ServiceTemplateModel>('serviceTemplate').findById(data.templateId);

        if (!template) throw { message: 'Template not found' };

        return Service.createModel({
            ...data,
            artist: data.artistId,
            studio: data.studioId,
            template: data.templateId,
            ...(template.type === 'physical' ? { date: typeof data.date === 'string' ? new Date(data.date) : data.date } : {}),
            type: template.type,
            owner: data.ownerId,
        });
    };

    ServiceSchema.statics.createModel = async function (data: IService) {
        /** Only create model, intern used only */
        const service = await ModelUtils.createHandler(new Service(data));
        /** Service post created */
        return service;
    };

    /** ----------------------- Edit ----------------------- */
    ServiceSchema.methods.edit = async function (req: Request) {
        const { comment, date, status, owner } = req.body;
        const service = this;

        service.editValue(req, comment, 'comment');
        service.editValue(req, date, 'date');
        service.editValue(req, status, 'status');
        service.editValue(req, owner, 'owner');
        if (req.files) {
            const ids = (req.files as Array<Express.Multer.File & { id: ObjectId }>).map(function (file) {
                return file.id; // or file.originalname
            });
            service.files = service.files.concat(ids);
        }

        await service.save();
    };

    /** ----------------------- Delete ----------------------- */
    ServiceSchema.methods.delete = async function () {
        const service = this;

        if (service._isDeleted) return;
        service._isDeleted = true;

        await mongoose.model('user').updateMany({ services: { $in: [service._id] } }, { $pull: { studios: service._id } });

        /** Delete service */
        if (!(await mongoose.model('service').findOneAndDelete({ _id: service._id }))) throw { message: 'Delete failed' };
    };

    return ServiceSchema;
}
