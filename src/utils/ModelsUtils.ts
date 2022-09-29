import { IServiceTemplate, ServiceTemplateMethods } from './../models/ServiceTemplate/types';
import { ServiceMethods } from './../models/Service/types';
import { IStudio, StudioMethods } from './../models/Studio/types';
import { UserMethods } from './../models/User/types';
import mongoose, { Document, Types } from 'mongoose';
import { IUser } from '../models/User/types';
import { IService } from '../models/Service/types';

export const isEq = (doc1: Document | any, doc2: Document | any) => {
    if (!doc1 || !doc2) return false;
    const value1 = typeof doc1 !== 'string' ? doc1._id : doc1;
    const value2 = typeof doc2 !== 'string' ? doc2._id : doc2;
    return value1.toString() === value2.toString();
};

type Type =
    | (Document<unknown, any, IUser> & IUser & Required<{ _id: string | Types.ObjectId }> & UserMethods)
    | (Document<unknown, any, IStudio> & IStudio & Required<{ _id: string | Types.ObjectId }> & StudioMethods)
    | (Document<unknown, any, IService> & IService & Required<{ _id: string | Types.ObjectId }> & ServiceMethods)
    | (Document<unknown, any, IServiceTemplate> & IServiceTemplate & Required<{ _id: string | Types.ObjectId }> & ServiceTemplateMethods);

const isUserModel = (model: Type): model is Document<unknown, any, IUser> & IUser & Required<{ _id: string }> & UserMethods => {
    return model.collection.collectionName === 'users';
};

const isStudioModel = (model: Type): model is Document<unknown, any, IStudio> & IStudio & Required<{ _id: string }> & StudioMethods => {
    return model.collection.collectionName === 'studios';
};

const isServiceModel = (model: Type): model is Document<unknown, any, IService> & IService & Required<{ _id: string }> & ServiceMethods => {
    return model.collection.collectionName === 'services';
};

const getDocumentValue = (document?: Type) => {
    if (!document) return undefined;
    if (isUserModel(document)) return document.studios;
    else if (isStudioModel(document)) return document._id;
    else return document.studio;
};

export const canAccessDocument = (mainDocument?: Type, document?: Type) => {
    const value = getDocumentValue(document);

    if (!mainDocument) return false;
    if (!document) return false;

    if (isUserModel(mainDocument)) {
        if (mainDocument.profile.permissionLevel === 0) return true;
        if (isServiceModel(document) && mainDocument.profile.permissionLevel === 3) isEq(mainDocument._id, document.artist);
        if (isServiceModel(document) && mainDocument.profile.permissionLevel < 3) isEq(mainDocument._id, document.owner);
        if (isUserModel(document) && document.profile.permissionLevel === 0 && Array.isArray(document.studios) && document.studios.length === 0)
            return true; /** lvl 1 & 2 user can access data of lvl 0 user */
        return mainDocument.studios.some((elem) => (Array.isArray(value) ? value.some((id) => isEq(elem, id)) : isEq(elem, value)));
    } else if (isStudioModel(mainDocument)) return isEq(mainDocument._id, value);
    else if (isServiceModel(mainDocument)) return isEq(mainDocument.studio, value);
    else return Array.isArray(value) ? value.some((id) => isEq(mainDocument.studio, id)) : isEq(mainDocument.studio, value);
};

const createHandler = async function <T>(data: Document<unknown, any, T>) {
    try {
        await data.save();
        return data;
    } catch (error: any) {
        if (error.success !== undefined) throw error; /** Already custom error */
        if (error) {
            if (error.code === 11000)
                throw {
                    message: 'Invalid body: [' + Object.keys(error.keyPattern) + '] already exist',
                };
            throw error;
        }
        throw { message: 'Invalid body' };
    }
};

const ValidId = (ids: any) => {
    if (!ids) throw { message: 'Id validation failed' };
    const keys = Object.keys(ids);
    if (!keys || !Array.isArray(keys)) throw { msg: 'tmp' };
    keys.forEach((key) => {
        if (Array.isArray(ids[key])) {
            const data: { [key: string]: any } = {};
            ids[key].forEach((elem: any, index: number) => {
                data[key + '[' + index + ']'] = elem;
            });
            ValidId(data);
        } else if (!mongoose.Types.ObjectId.isValid(ids[key])) throw { message: 'Invalid id of field ' + key };
    });
    return true;
};
// const Empty = (obj) => !obj || Object.keys(obj).length === 0
// const SpecificParam = (req, param) =>
//     !req || !req.query || Object.keys(req.query).length === 0 || req.query[param] === 'true' || req.query[param] === '1'

// const Num = (number, digits = 2) => parseFloat(number.toFixed(digits))
// const ValidId = (ids) => {
//     if (!ids) throw ({ success: false, message: 'Id validation failed' })
//     const keys = Object.keys(ids)
//     if (!keys || !Array.isArray(keys)) throw ({ success: false, msg: 'tmp' })
//     keys.forEach((key) => {
//         if (Array.isArray(ids[key])) {
//             const data = {}
//             ids[key].forEach((elem, index) => {
//                 data[key + '[' + index + ']'] = elem
//             })
//             ValidId(data)
//         } else if (!mongoose.Types.ObjectId.isValid(ids[key]))
//             throw new Error({ success: false, message: 'Invalid id of field ' + key })
//     })
//     return true
// }

const ModelUtils = {
    createHandler,
    canAccessDocument,
    ValidId,
    isEq,
};

export default ModelUtils;
