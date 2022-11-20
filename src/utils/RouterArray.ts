import mongoose from 'mongoose';
import pluralize from 'pluralize';
import Auth from '../middleware/auth';
import { routerArrayCanAccessDocument, canAccessDocument } from './ModelsUtils';
import ModelUtils from './ModelsUtils';
import { addArray } from './ObjectUtils';

/**
 *  Example :
 *  RouterArray(router, 'AddID', main: { name: 'sale' }, element: { name: 'user', arrayPath: 'users' } });
 *
 *  opts : preAdd
 *  opts : preDelete
 */
export default (router: any, type: any, opts: any) => {
    if (!opts || !type) throw { success: false, message: 'Router Array error' };

    if (!opts.auth) opts.auth = {}; /** Default auth for routes */
    if (!opts.auth.add) opts.auth.add = Auth.User;
    if (!opts.auth.delete) opts.auth.delete = Auth.User;
    if (opts.auth.canAccessCheck === undefined) opts.auth.canAccessCheck = true;

    if (!opts.element.as) opts.element.as = opts.element.name;
    if (!opts.element.routeAs) opts.element.routeAs = opts.element.name;

    if (!opts.main.routeAs) opts.main.routeAs = opts.main.name;

    if (!opts.methods) opts.methods = ['POST', 'GET', 'PATCH', 'DELETE'];
    if (!Array.isArray(opts.methods) || !opts.methods.length) throw { success: false, message: 'RouterArray : Invalid opts.methods' };

    if (!opts.shortPath) opts.shortPath = '/' + opts.main.routeAs + '/:' + opts.main.name + 'Id/' + pluralize(opts.element.routeAs);

    if (type === 'AddID') {
        if (!opts.main || !opts.main.name || !opts.element || !opts.element.arrayPath || !opts.element.name) throw { success: false, message: 'Invalid router array opts for type ' + type };
        if (!opts.path) opts.path = '/' + opts.main.routeAs + '/:' + opts.main.name + 'Id/' + opts.element.routeAs + '/:' + opts.element.as + 'Id';

        /* Create Element */
        if (opts.methods.includes('POST'))
            router.post(opts.path, opts.auth.add, async (req: any, res: any) => {
                try {
                    const mainIdParamName = opts.main.name + 'Id';
                    const elementIdParamName = opts.element.as + 'Id';

                    const mainId = req.params[mainIdParamName];
                    const elementId = req.params[elementIdParamName];
                    ModelUtils.ValidId({ [opts.main.name + 'Id']: mainId, [opts.element.as + 'Id']: elementId });

                    const mainElement: any = await mongoose.model(opts.main.name).findOne({ _id: mainId });
                    if (!mainElement) throw { success: false, message: 'Unable to find ' + opts.main.name };
                    if (!canAccessDocument(req.user, mainElement)) throw { success: false, message: 'Unauthorized' };

                    const arrayElement: any = await mongoose.model(opts.element.name).findOne({ _id: elementId });
                    if (!arrayElement) throw { success: false, message: 'Unable to find ' + opts.element.as };
                    if (!canAccessDocument(req.user, arrayElement)) throw { success: false, message: 'Unauthorized' };

                    if (opts.auth.canAccessCheck && !routerArrayCanAccessDocument(mainElement, arrayElement))
                        throw { success: false, message: 'Cannot add ' + mainElement.constructor.modelName + ' to ' + opts.element.as + ' with different agencies' };

                    if (opts.preAdd) await opts.preAdd({ mainElement, arrayElement, user: req.user });
                    addArray(mainElement[opts.element.arrayPath], arrayElement, mainElement);

                    await mainElement.save();
                    if (opts.postAdd) await opts.postAdd({ mainElement, arrayElement, user: req.user });

                    return res.status(200).send({ success: true });
                } catch (error) {
                    Auth.ErrorHandler(req, res, error);
                }
            });

        /* Delete Element */
        if (opts.methods.includes('DELETE'))
            router.delete(opts.path, opts.auth.delete, async (req: any, res: any) => {
                try {
                    const mainId = req.params[opts.main.name + 'Id'];
                    const elementId = req.params[opts.element.as + 'Id'];
                    ModelUtils.ValidId({ [opts.main.name + 'Id']: mainId, [opts.element.as + 'Id']: elementId });

                    const mainElement: any = await mongoose.model(opts.main.name).findOne({ _id: mainId });
                    if (!mainElement) throw { success: false, message: 'Unable to find ' + opts.main.name };
                    if (!canAccessDocument(req.user, mainElement)) throw { success: false, message: 'Unauthorized' };

                    if (opts.preDelete) await opts.preDelete({ mainElement, user: req.user });
                    await mainElement.removeArray(opts.element.arrayPath, elementId, { elementName: opts.element.as });
                    if (opts.postDelete) await opts.postDelete({ mainElement, user: req.user });

                    return res.status(200).send({ success: true });
                } catch (error) {
                    Auth.ErrorHandler(req, res, error);
                }
            });
    } else if (type === 'AddModel') {
        if (!opts.main || !opts.main.name || !opts.element || !opts.element.arrayPath || !opts.element.name) throw { success: false, message: 'Invalid router array opts for type ' + type };

        if (!opts.path) opts.path = '/' + opts.main.routeAs + '/:' + opts.main.name + 'Id/' + opts.element.routeAs;

        /* Create Element */
        if (opts.methods.includes('POST'))
            router.post(opts.path, opts.auth.add, async (req: any, res: any) => {
                try {
                    const mainId = req.params[opts.main.name + 'Id'];
                    ModelUtils.ValidId({ [opts.main.name + 'Id']: mainId });

                    const mainElement: any = await mongoose.model(opts.main.name).findOne({ _id: mainId });
                    if (!mainElement) throw { success: false, message: 'Unable to find ' + opts.main.name };
                    if (!canAccessDocument(req.user, mainElement)) throw { success: false, message: 'Unauthorized' };

                    const model: any = mongoose.model<any>(opts.element.name);

                    /** Using createModel if exist else switch to create */
                    const arrayElement: any = await model.create(req.body);
                    if (!arrayElement) throw { success: false, message: 'Unable to create ' + opts.element.as };
                    arrayElement._id = new mongoose.Types.ObjectId();

                    const arrayObject = mainElement.getNestedPath(opts.element.arrayPath);

                    // if (mongoose.model<any>(opts.element.name).preAdd) mongoose.model(opts.element.name).preAdd(arrayObject, arrayElement);
                    if (opts.preAdd) await opts.preAdd(mainElement, arrayElement, req.user);
                    addArray(arrayObject, arrayElement, mainElement, { fullElement: true });
                    if (opts.postAdd) await opts.postAdd(mainElement, arrayElement, req.user);
                    // if (mongoose.model(opts.element.name).postAdd) arrayObject = await mongoose.model(opts.element.name).postAdd(arrayObject, arrayElement);

                    await mainElement.save();

                    const find = arrayObject.find((elem: any) => ModelUtils.isEq(elem._id, arrayElement._id));
                    if (!find) throw { success: false, message: opts.element.as + ' already exist' };
                    // if (!find.prototype instanceof mongoose.Model) throw { success: false, message: 'Unable to create model' };

                    return res.status(201).send({ success: true, [opts.element.as]: await find.generateJSON(req) });
                } catch (error) {
                    Auth.ErrorHandler(req, res, error);
                }
            });

        /* Edit Element */
        if (opts.methods.includes('PATCH'))
            router.patch(opts.path + '/:' + opts.element.as + 'Id', opts.auth.add, async (req: any, res: any) => {
                try {
                    const mainId = req.params[opts.main.name + 'Id'];
                    const elementId = req.params[opts.element.as + 'Id'];
                    ModelUtils.ValidId({ [opts.main.name + 'Id']: mainId, [opts.element.as + 'Id']: elementId });

                    const mainElement: any = await mongoose.model(opts.main.name).findOne({ _id: mainId });
                    if (!mainElement) throw { success: false, message: 'Unable to find ' + opts.main.name };
                    if (!canAccessDocument(req.user, mainElement)) throw { success: false, message: 'Unauthorized' };

                    const arrayObject = mainElement.getNestedPath(opts.element.arrayPath);
                    const find = arrayObject.find((elem: any) => ModelUtils.isEq(elem._id, elementId));
                    if (!find) throw { success: false, message: 'Unable to find ' + opts.element.as };

                    if (!find.edit) throw { success: false, message: 'Edit function not defined' };
                    await find.edit(req, req.body);
                    await mainElement.save();

                    return res.status(200).send({ success: true, [opts.element.as]: await find.generateJSON(req) });
                } catch (error) {
                    Auth.ErrorHandler(req, res, error);
                }
            });

        /* Get Element */
        if (opts.methods.includes('GET'))
            router.get(opts.path + '/:' + opts.element.as + 'Id', opts.auth.add, async (req: any, res: any) => {
                try {
                    const mainId = req.params[opts.main.name + 'Id'];
                    const elementId = req.params[opts.element.as + 'Id'];
                    ModelUtils.ValidId({ [opts.main.name + 'Id']: mainId, [opts.element.as + 'Id']: elementId });

                    const mainElement: any = await mongoose.model(opts.main.name).findOne({ _id: mainId });
                    if (!mainElement) throw { success: false, message: 'Unable to find ' + opts.main.name };
                    if (!canAccessDocument(req.user, mainElement)) throw { success: false, message: 'Unauthorized' };

                    const arrayObject = mainElement.getNestedPath(opts.element.arrayPath);
                    const find = arrayObject.find((elem: any) => ModelUtils.isEq(elem._id, elementId));
                    if (!find) throw { success: false, message: 'Unable to find ' + opts.element.as };

                    return res.status(200).send({ success: true, [opts.element.as]: await find.generateJSON(req) });
                } catch (error) {
                    Auth.ErrorHandler(req, res, error);
                }
            });

        /* Get every elements */
        if (opts.methods.includes('GET'))
            router.get(opts.shortPath, opts.auth.add, async (req: any, res: any) => {
                try {
                    const mainId = req.params[opts.main.name + 'Id'];
                    ModelUtils.ValidId({ [opts.main.name + 'Id']: mainId });

                    const mainElement: any = await mongoose.model(opts.main.name).findOne({ _id: mainId });
                    if (!mainElement) throw { success: false, message: 'Unable to find ' + opts.main.name };
                    if (!canAccessDocument(req.user, mainElement)) throw { success: false, message: 'Unauthorized' };

                    const arrayObject = mainElement.getNestedPath(opts.element.arrayPath);
                    const formattedArrayObject = await Promise.all(arrayObject.map(async (obj: any) => await obj.generateJSON()));

                    return res.status(200).send({ success: true, [pluralize(opts.element.as)]: formattedArrayObject });
                } catch (error) {
                    Auth.ErrorHandler(req, res, error);
                }
            });

        /* Delete Element */
        if (opts.methods.includes('DELETE'))
            router.delete(opts.path + '/:' + opts.element.as + 'Id', opts.auth.delete, async (req: any, res: any) => {
                try {
                    const mainId = req.params[opts.main.name + 'Id'];
                    const elementId = req.params[opts.element.as + 'Id'];
                    ModelUtils.ValidId({ [opts.main.name + 'Id']: mainId, [opts.element.as + 'Id']: elementId });

                    const mainElement: any = await mongoose.model(opts.main.name).findOne({ _id: mainId });
                    if (!mainElement) throw { success: false, message: 'Unable to find ' + opts.main.name };
                    if (!canAccessDocument(req.user, mainElement)) throw { success: false, message: 'Unauthorized' };

                    await mainElement.removeArray(opts.element.arrayPath, elementId, { elementName: opts.element.as });

                    return res.status(200).send({ success: true });
                } catch (error) {
                    Auth.ErrorHandler(req, res, error);
                }
            });
    }

    /* Delete every elements */
    if (opts.methods.includes('DELETE'))
        router.delete(opts.shortPath, opts.auth.delete, async (req: any, res: any) => {
            try {
                const mainId = req.params[opts.main.name + 'Id'];
                ModelUtils.ValidId({ [opts.main.name + 'Id']: mainId });

                const mainElement: any = await mongoose.model(opts.main.name).findOne({ _id: mainId });
                if (!mainElement) throw { success: false, message: 'Unable to find ' + opts.main.name };
                if (!canAccessDocument(req.user, mainElement)) throw { success: false, message: 'Unauthorized' };

                const realPath = opts.element.arrayPath.split('.');
                if (realPath.length > 1) {
                    const pop = realPath.pop();

                    let shortPath = '';
                    realPath.forEach((elem: any, index: number) => (shortPath += elem + (index !== realPath.length - 1 ? '.' : '')));

                    mainElement.getNestedPath(shortPath)[pop] = [];
                } else mainElement[opts.element.arrayPath] = [];

                await mainElement.save();

                return res.status(200).send({ success: true });
            } catch (error) {
                Auth.ErrorHandler(req, res, error);
            }
        });
};
