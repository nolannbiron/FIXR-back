import { Schema } from 'mongoose';
import { Request } from '../../common';
import { IServiceTemplate, ServiceTemplateModel } from './types';
import AggregateUtils from '../../utils/AggregateUtils';
import ServiceTemplate from './ServiceTemplate';
import { createQueryStudios } from '../../utils/RouterUtils';

export async function initialQueryServices(req: any) {
    return createQueryStudios(req, { typeName: 'studio' });
}

/** Possibility to have better performance by moving countDetails & countTotalValue inside filterSales */
export async function filterServiceTemplates(req: any) {
    const defaultQuery = await initialQueryServices(req);

    const aggregateUtils = new AggregateUtils(ServiceTemplate, req, defaultQuery, {
        overideMaximumAmount: 10000, // performance tests
    });
    await aggregateUtils.launch();
    return aggregateUtils.formatResult('services');
}

export default function (ServiceTemplateSchema: Schema<IServiceTemplate, ServiceTemplateModel>) {
    ServiceTemplateSchema.methods.generateJSON = async function (req: Request) {
        const service = this;

        return await service.generateJSON_(req);
    };

    ServiceTemplateSchema.methods.servicePreSave = async function () {
        // const serviceTemplate = this;
    };
}
