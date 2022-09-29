import { IUser, UserModel } from './../User/types';
import mongoose, { Schema } from 'mongoose';
import { IService, ServiceModel } from './types';
import Service from './Service';
import AggregateUtils from '../../utils/AggregateUtils';
import { createQueryStudios } from '../../utils/RouterUtils';
import LocalCopy from '../LocalCopy/LocalCopy';
import { IServiceTemplate, ServiceTemplateModel } from '../ServiceTemplate/types';
import ModelUtils from '../../utils/ModelsUtils';
import { Request } from '../../common';

async function getStudioQueries(req: Request, type: any) {
    if (!type || !['services'].includes(type)) throw { success: false, message: 'Internal error : getAgenciesQuery' };

    const studiosSettings = await mongoose.model('studio').find(
        {
            _id: { $in: req.user?.studios },
        },
        { _id: 1 },
    );
    if (!Array.isArray(studiosSettings) || !studiosSettings.length) return undefined;

    return { $in: studiosSettings.map((elem) => elem._id) };
}

async function createTransactionQuery(req: Request, defaultQuery: any, type: any) {
    //&& ['true', undefined].includes(req?.query.private) HANDLE PRIVATE

    if (req.user && req.user.profile.permissionLevel >= 3) {
        if (!defaultQuery.$and) defaultQuery.$and = [];
        const localQuery: Record<string, any> = { $or: [] };
        const studioQuery = await getStudioQueries(req, type);

        localQuery.$or.push({ owner: { $exists: false } }); /** card is in STK */
        localQuery.$or.push({ owner: req.user._id });

        if (studioQuery) localQuery.$or.push({ agency: studioQuery }); /** keep */

        defaultQuery.$and.push(localQuery);
    }

    return defaultQuery;
}

export async function initialQueryServices(req: any) {
    const defaultQuery = createQueryStudios(req, { typeName: 'studio' });
    const newDefaultQuery = await createTransactionQuery(req, defaultQuery, 'services');
    return newDefaultQuery;
}

/** Possibility to have better performance by moving countDetails & countTotalValue inside filterSales */
export async function filterServices(req: any) {
    const defaultQuery = await initialQueryServices(req);

    const aggregateUtils = new AggregateUtils(Service, req, defaultQuery, {
        overideMaximumAmount: 10000, // performance tests
    });
    await aggregateUtils.launch();
    return aggregateUtils.formatResult('services');
}

export default function (ServiceSchema: Schema<IService, ServiceModel>) {
    ServiceSchema.methods.generateJSON = async function () {
        const service = this;

        await service.populateAsync('template artist studio owner');

        return {
            id: service._id,
            artist: service.artist ? { id: service.artist._id, firstName: service.artist.firstName, lastName: service.artist.lastName, username: service.artist.username } : undefined,
            template: service.template ? { id: service.template._id, name: service.template.name, price: service.template.price, type: service.template.type } : undefined,
            studio: service.studio._id,
            date: service.date ? service.date : undefined,
            comment: service.comment ? service.comment : '',
            status: service.status,
            createdAt: service.createdAt,
            updatedAt: service.updatedAt,
            owner: service.owner ? { id: service.owner._id, firstName: service.owner.firstName, lastName: service.owner.lastName, username: service.owner.username } : undefined,
        };
    };

    ServiceSchema.methods.servicePreSave = async function () {
        const service = this;

        if (service.owner && service.isModified('owner')) {
            const owner = await mongoose.model<IUser, UserModel>('user').findOne({ _id: service.owner, ...mongoose.model<IUser, UserModel>('user').serviceArtistQuery([service.studio]) });
            if (!owner) throw { success: false, message: 'Invalid owner' };
            service.updateLocalCopies('user', [owner]);
        }

        /** Check owner */
        if (service.artist && service.isModified('artist')) {
            const artist = await mongoose.model<IUser, UserModel>('user').findOne({ _id: service.artist, ...mongoose.model<IUser, UserModel>('user').serviceArtistQuery([service.studio]) });
            if (!artist) throw { success: false, message: 'Invalid artist' };
            service.updateLocalCopies('user', [artist]);
        }

        if (service.template && service.isModified('template')) {
            const template = await mongoose.model<IServiceTemplate, ServiceTemplateModel>('serviceTemplate').findOne({ _id: service.template });
            if (!template) throw { success: false, message: 'Invalid template' };
            service.updateLocalCopies('template', [template]);
        }
    };

    ServiceSchema.methods.updateLocalCopies = function (modelName: string, array: any[]) {
        const service = this;

        if (!Array.isArray(service.localCopies)) service.localCopies = [];

        /** Clean every old localCopies of same type */
        service.localCopies = service.localCopies.filter((elem: any) => !array.find((elem2: any) => elem2._id === elem.model));
        /** Add new localCopies */
        if (Array.isArray(array)) {
            array.forEach((elem) => {
                const localCopy = LocalCopy.create(elem);
                if (localCopy) service.localCopies.push(localCopy);
            });
        }
    };

    ServiceSchema.methods.isOwner = function (user: any) {
        const service = this;

        if (!user || !user.constructor || user?.constructor?.modelName !== 'user') throw { success: false, message: 'Internal error : serviceCanAccess invalid user' };
        return user.profile.permissionLevel < 3 || ModelUtils.isEq(user._id, service.owner);
    };

    ServiceSchema.methods.serviceCanAccess = async function (user: any) {
        const service = this;

        if (
            user.profile.permissionLevel < 3 ||
            service.isOwner(user) ||
            (Array.isArray(service.users) && service.users.some((user) => ModelUtils.isEq(user, user._id))) ||
            (Array.isArray(service.groups) && service.groups.some((group) => user.hasGroup(group)))
        )
            /** Owner or same group */
            return true;

        // const agency = await mongoose.model('agency').findOne({ _id: service.agency });
        // if (
        //     studio &&
        //     ((service.constructor?.modelName === 'service' && agency.settings.serviceAccessRestriction !== 'sales' && studio.settings.serviceAccessRestriction !== 'all')
        // )
        //     return true;

        if (!service.owner) return true; /** service is in stack */
        const owner = await mongoose.model('user').findOne({ _id: service.owner });
        if (owner) return true;
        return false;
    };
}
