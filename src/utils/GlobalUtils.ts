import mongoose, { Schema } from 'mongoose';
import { Request } from '../common';
import { IUser } from '../models/User/types';
import { canAccessField, W } from './modelAccess';
import ModelUtils from './ModelsUtils';

const editValue = (document: any, req: Request, checkUndefNull: boolean, value: any, ...types: []) => {
    let ret = false;
    if (value === undefined || (checkUndefNull && value === null)) return ret;
    types.forEach((elem, index) => {
        if (index === types.length - 1) {
            const modelName = document?.constructor?.modelName ? document?.constructor?.modelName : document.getModelName();
            if (!modelName) return ret;
            const mongooseModel = mongoose.model<IUser, { schema: { obj: { access: [] }[] } }>(modelName);
            if (mongooseModel && mongooseModel?.schema?.obj) {
                const modelJSON = mongooseModel.schema.obj;
                if (document && modelJSON[elem]?.access && canAccessField(req, modelJSON[elem].access, W, document, elem) && document[elem] !== value) {
                    if (value === null) document[elem] = undefined;
                    else document[elem] = value;
                    ret = true;
                } else if (modelJSON[elem]?.access === undefined) {
                    // todo /** todo remove : Allow edit for model without access defined */
                    if (value === null) document[elem] = undefined;
                    else document[elem] = value;
                    ret = true;
                }
            }
        } else {
            if (document[elem] === undefined) document[elem] = {};
            document = document[elem];
        }
    });
    return ret;
};

export const capitalize = (s: string) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

export default function (schema: Schema<any, any>) {
    schema.methods.postCreated = async function (func: () => void) {
        const document = this;
        try {
            if (func) await func();
        } catch (err) {
            if (document.delete) await document.delete();
            throw err;
        }
    };
    schema.methods.populateAsync = async function (data: any) {
        const document = this;

        const arr = data.split(' ');
        let str = '';
        arr.forEach((elem: any) => {
            if (!document.populated(elem)) {
                if (str.length) str += ' ';
                str += elem;
            }
        });
        if (str && str.length) await document.populate(str);
    };

    schema.methods.getNestedPath = function (path: string) {
        const document = this;

        const paths = path.split('.');
        return paths.reduce((object, path) => {
            return (object || {})[path];
        }, document);
    };

    schema.methods.setNestedPath = function (path: string, value: any) {
        const document = this;

        const paths = path.split('.');
        paths.reduce((object, path, index) => {
            if (index === paths.length - 1) object[path] = value;
            return (object || {})[path];
        }, document);
    };

    schema.pre(/^find/, function () {
        const query: any = this.getQuery();
        if (query.isDeleted === false) {
            this._conditions = {
                ...query,
                isDeleted: { $ne: true },
            };
        }
    });
    schema.pre(/^update/, function () {
        const query = this.getQuery();
        this._conditions = {
            ...query,
            isDeleted: { $ne: true },
        };
    });

    schema.methods.removeArray = async function (path: string, arrayElementId: [], opts = { save: true, elementName: undefined }) {
        const document = this;

        if (!opts) opts = { save: true, elementName: undefined };
        if (opts.save === undefined) opts.save = true;
        if (opts.elementName === undefined) throw { message: 'Internal error : removeArray : elementName not specified' };

        const arrayObject = document.getNestedPath(path);
        if (!Array.isArray(arrayObject) || !arrayObject.some((elem) => ModelUtils.isEq(elem, arrayElementId))) throw { message: 'Unable to find ' + opts.elementName };
        document.setNestedPath(
            path,
            arrayObject
                .filter((elem) => !ModelUtils.isEq(elem, arrayElementId))
                .map((elem) => {
                    elem.__FIXR_afterDelete = true;
                    return elem;
                }),
        );

        if (opts.save) await document.save();
    };

    schema.methods.updateCount = async function (dataType: string, amount: number, save = true) {
        const document = this;

        document[dataType] += amount;
        if (document[dataType] < 0) document[dataType] = 0;
        if (save) await document.save();
    };

    schema.methods.editValue = function (req: any, value: any, ...types: []) {
        return editValue(this, req, true, value, ...types);
    };
    schema.methods.editValueUndefined = function (req: any, value: any, ...types: []) {
        return editValue(this, req, false, value, ...types);
    };

    schema.pre('save', function () {
        const document = this;

        const modifiedPaths = this.modifiedPaths();
        if (Array.isArray(modifiedPaths)) modifiedPaths.forEach((mPath) => (document['__FIXR_UPDATED__' + mPath] = true));
        if (document._isNew) {
            document.__isNew = true;
            document._isNew = false;
        }
    });

    schema.methods.generateJSON_ = async function (req: any) {
        const document = this;

        const ret: { id?: string; [key: string]: any } = {};
        const modelName = document?.constructor()?.modelName ? document?.constructor()?.modelName : document.getModelName();
        if (!modelName) throw { message: 'Invalid document : unable to find modelName' };
        const mongooseModel = mongoose.model(modelName);
        if (mongoose.Types.ObjectId.isValid(document._id)) ret.id = document._id.toString();
        if (mongooseModel && mongooseModel?.schema?.obj) {
            const modelJSON: any = mongooseModel.schema.obj;
            const keys = Object.keys(modelJSON);
            if (Array.isArray(keys))
                await Promise.all(
                    keys.map(async (key) => {
                        const field = modelJSON[key];
                        if (document[key]) {
                            /** Check if is populatedSubObject */
                            const getPopulateSubObject = async (obj: any) => {
                                if (obj?.generateJSON) return await obj.generateJSON(req);
                                return obj;
                            };

                            /** Check if is Array */
                            if (Array.isArray(field.type)) ret[key] = await Promise.all(document[key].map((elem: any) => getPopulateSubObject(elem)));
                            else ret[key] = await getPopulateSubObject(document[key]);
                        }
                    }),
                );
        }
        return ret;
    };

    return schema;
}
