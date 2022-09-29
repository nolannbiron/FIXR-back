import express, { Response } from 'express';
import Auth from '../../middleware/auth';
import ModelUtils from '../../utils/ModelsUtils';
import ServiceTemplate from '../../models/ServiceTemplate/ServiceTemplate';
import { Request } from '../../common';
import { filterServiceTemplates } from '../../models/ServiceTemplate/ServiceTemplateUtils';

const router = express.Router();

/* Get a list of all studios */
router.get('/serviceTemplates', Auth.Admin, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const serviceTemplates = await filterServiceTemplates(req);
        return res.status(200).send({ success: true, serviceTemplates });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Create a serviceTemplate */
router.post('/serviceTemplate', Auth.Root, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const serviceTemplate = await ServiceTemplate.createServiceTemplate(req.body);
        return res.status(201).send({ success: true, serviceTemplate: await serviceTemplate.generateJSON() });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Get specific serviceTemplate informations */
router.get('/serviceTemplate/:serviceId', Auth.User, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const { serviceId } = req.params;
        ModelUtils.ValidId({ serviceId });

        const serviceTemplate = await ServiceTemplate.findOne({ _id: serviceId });
        if (!serviceTemplate) throw { message: 'Unable to find serviceTemplate' };
        if (!ModelUtils.canAccessDocument(req.user, serviceTemplate)) throw { message: 'You are not allowed to access this serviceTemplate' };

        return res.status(200).send({ success: true, serviceTemplate: serviceTemplate.generateJSON() });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Edit a serviceTemplate */
router.patch('/serviceTemplate/:serviceId', Auth.Admin, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const { serviceId } = req.params;
        ModelUtils.ValidId({ serviceId });

        const serviceTemplate = await ServiceTemplate.findOne({ _id: serviceId });
        if (!serviceTemplate) throw { message: 'Unable to find serviceTemplate' };
        if (!ModelUtils.canAccessDocument(req.user, serviceTemplate)) throw { message: 'You are not allowed to access this serviceTemplate' };

        await serviceTemplate.edit(req);

        return res.status(200).send({ success: true, serviceTemplate: await serviceTemplate.generateJSON() });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Delete a serviceTemplate */
router.delete('/serviceTemplate/:serviceId', Auth.Root, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const { serviceId } = req.params;
        ModelUtils.ValidId({ serviceId });

        const serviceTemplate = await ServiceTemplate.findOne({ _id: serviceId });
        if (!serviceTemplate) throw { message: 'Unable to find serviceTemplate' };

        await serviceTemplate.delete(req);

        return res.status(200).send({ success: true });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

// RouterArrayEmployee(router, 'AddModel', {
//     main: { name: 'serviceTemplate' },
//     element: { routeAs: 'opening-hour', as: 'openingHour', name: 'openingHour', arrayPath: 'openingHours' },
//     auth: { add: Auth.Admin, delete: Auth.Admin },
// })

// RouterArrayEmployee(router, 'AddID', {
//     main: { name: 'serviceTemplate' },
//     element: { routeAs: 'client', as: 'clients', name: 'user', arrayPath: 'clients' },
//     auth: { add: Auth.Admin, delete: Auth.Admin },
// })

// RouterArrayEmployee(router, 'AddModel', {
//     main: { name: 'serviceTemplate' },
//     element: { name: 'product', arrayPath: 'products' },
// })

// RouterArrayEmployee(router, 'AddModel', {
//     main: { name: 'serviceTemplate' },
//     element: { name: 'contact', arrayPath: 'contacts' },
// })

export default router;
