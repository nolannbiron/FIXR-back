import mongoose from 'mongoose';
import ModelUtils from './ModelsUtils';
import { IUser } from '../models/User/types';

const getRequestedIds = (req: any) => {
    const user = req.user;
    let ids = [];

    if (!req.query || !req.query.studios) return undefined;
    ids = req.query.studios.split(',');
    if (ids.some((id: any) => !mongoose.Types.ObjectId.isValid(id))) throw { success: false, message: 'Invalid studios ids in query' };

    if (user.profile.permissionLevel >= 1 && ids.some((id: any) => !user.studios.some((studioId: any) => ModelUtils.isEq(studioId, id))))
        throw { success: false, message: 'Invalid studios id in query : Cannot access informations from unposseded studio' };

    return ids.map((id: any) => new mongoose.Types.ObjectId(id));
};

const createQueryStudios = (req: any, opts: any) => {
    /** Specify access in opts */
    const defaultQuery: Record<string, any> = {};

    if (!opts.typeName) opts.typeName = 'studio';

    if (!req.user) throw { success: false, message: 'Invalid request origin' };
    if (req.user) {
        if (!req.user.profile) throw { success: false, message: 'Invalid user profile' };
    }

    const requestedIds = getRequestedIds(req);

    if (req.user.profile.permissionLevel >= 1) {
        /** Handle agencies admins & default users */
        if (!Array.isArray(req.user.studios)) throw { success: false, message: "Invalid user's studios" };

        if (requestedIds) defaultQuery[opts.typeName] = { $in: requestedIds };
        else defaultQuery[opts.typeName] = createQuerySelfStudios(req.user);
    } else {
        /** Handle roots & linkedAPIs */
        if (requestedIds) defaultQuery[opts.typeName] = { $in: requestedIds };
    }

    return defaultQuery;
};

const createQuerySelfStudios = (user: IUser, opts?: any) => {
    if (!user) throw { success: false, message: 'Invalid user' };
    return { $in: user.studios.map((id) => (typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id)) };
};

const createDocumentStudioTemplate = (document: any, body: any) => {
    if (document.constructor.modelName === 'user') return createDocumentStudio(document, body);
    else if (document.constructor.modelName === 'studio') return document._id;
    else return document.studio;
};
const createDocumentStudio = (user: IUser, body: any) => {
    if (user.profile.permissionLevel === 0) {
        /** Root */
        if (!body.studio) throw { success: false, message: 'To create current document, specify an studio' };
        if (!mongoose.Types.ObjectId.isValid(body.studio)) throw { success: false, message: 'Invalid studio id' };
        return body.studio;
    }
    if (user.profile.permissionLevel >= 2) {
        /** Admin */
        if (user.studios.length > 1) {
            if (!body.studio) throw { success: false, message: 'To create current document, specify an studio' };
            if (!mongoose.Types.ObjectId.isValid(body.studio)) throw { success: false, message: 'Invalid studio id' };
            return body.studio;
        } else return user.studios[0];
    }
    if (user.profile.permissionLevel > 2) {
        /** Default user */
        return user.studios[0];
    }
};

// Old version
// async function createQueryOrganization(req, opts) {
//     const defaultQuery = {};
//     if (opts) {
//         if (opts.accessUndefinedOrganization === undefined) opts.accessUndefinedOrganization = true;
//     } else opts = { lambdaUserGenerateQuery: undefined, accessUndefinedOrganization: true };

//     if (!req.user) throw { success: false, message: 'Invalid user' };
//     if (req.user.root) { /** root : globalOrganization: true, false or undefined */
//         const id = req.query.organization;
//         if (req.query.globalOrganization === 'true') defaultQuery.organization = { $exists: false };
//         else if (id) {
//             if (req.query.globalOrganization === 'false') defaultQuery.organization = mongoose.Types.ObjectId(id);
//             else defaultQuery.$or = [{ organization: { $exists: false } }, { organization: mongoose.Types.ObjectId(id) }];
//         }

//     } else {
//         if (!req.user.profile) throw { success: false, message: 'Invalid user profile' };
//         if (!req.user.organization || !await ModelUtils.docExist('organization', req.user.organization)) // check if own orga exist ? necessary ??
//             throw { success: false, message: 'Invalid user organization' };

//         const id = req.user.organization.toString();
//         if (req.user.profile.admin) {
//             if (req.query.globalOrganization === 'true') defaultQuery.organization = { $exists: false };
//             else if (req.query.globalOrganization === 'false' || !opts.accessUndefinedOrganization) defaultQuery.organization = mongoose.Types.ObjectId(id);
//             else defaultQuery.$or = [{ organization: { $exists: false } }, { organization: mongoose.Types.ObjectId(id) }];
//         } else if (opts.lambdaUserGenerateQuery) return opts.lambdaUserGenerateQuery(req);
//         else defaultQuery.organization = mongoose.Types.ObjectId(id);
//     }
//     if (!req.user.root && !defaultQuery.organization && !defaultQuery.$or) throw { success: false, message: 'Must have an organization' };
//     return defaultQuery;
// }

export { createQueryStudios, createDocumentStudioTemplate, createDocumentStudio };
