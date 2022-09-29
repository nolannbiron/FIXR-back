import { Model, ObjectId } from 'mongoose';
import { Request } from '../../common';

export interface IServiceTemplate {
    // _id?: string | ObjectId;
    studio: string | ObjectId;
    name: string;
    price: number;
    type: 'physical' | 'digital';
    _isDeleted: boolean;
}

export interface ServiceTemplateMethods {
    edit: (req: Request) => Promise<ServiceTemplateModel>;
    delete: () => void;
    generateJSON: () => Promise<IServiceTemplate>;
    // servicePreSave: (service: ServiceTemplateModel) => Promise<void>;
}

export interface ServiceTemplateModel extends Model<IServiceTemplate, Record<string, unknown>, ServiceTemplateMethods> {
    createServiceTemplate: (data: Partial<IServiceTemplate> & { studioId: string; artistId: string }) => Promise<ServiceTemplateModel>;
    createModel: (data: Partial<IServiceTemplate>) => Promise<ServiceTemplateModel>;
    generateJSON: () => Promise<IServiceTemplate>;
    updateLocalCopies: (modelName: string, models: any[]) => void;
    // servicePreSave: (service: ServiceTemplateModel) => Promise<void>;
}
