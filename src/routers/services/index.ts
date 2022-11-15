import express, { Response } from 'express';
import Auth from '../../middleware/auth';
import ModelUtils from '../../utils/ModelsUtils';
import Service from '../../models/Service/Service';
import { Request } from '../../common';
import { filterServices } from '../../models/Service/ServiceUtils';
import { uploadFilesMiddleware } from '../../middleware/upload';
import { ObjectId } from 'mongodb';
import { getBucket } from '../../utils/Bucket';

const router = express.Router();

/* Get a list of all studios */
router.get('/services', Auth.Admin, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const services = await filterServices(req);
        console.log(services);
        return res.status(200).send({ success: true, ...services });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Create a service */
router.post('/service', Auth.Root, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const service = await Service.createService(req);
        return res.status(201).send({ success: true, service: await service.generateJSON() });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Get specific service informations */
router.get('/service/:serviceId', Auth.User, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const { serviceId } = req.params;
        ModelUtils.ValidId({ serviceId });

        const service = await Service.findOne({ _id: serviceId });
        if (!service) throw { message: 'Unable to find service' };
        if (!ModelUtils.canAccessDocument(req.user, service)) throw { message: 'You are not allowed to access this service' };
        if (!(await service.serviceCanAccess(req.user))) throw { success: false, message: 'You are not allowed to access this service' };

        return res.status(200).send({ success: true, service: await service.generateJSON() });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Edit a service */
router.patch('/service/:serviceId', Auth.Admin, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const { serviceId } = req.params;
        ModelUtils.ValidId({ serviceId });

        const service = await Service.findOne({ _id: serviceId });
        if (!service) throw { message: 'Unable to find service' };
        if (!ModelUtils.canAccessDocument(req.user, service)) throw { message: 'You are not allowed to access this service' };
        if (!(await service.serviceCanAccess(req.user))) throw { success: false, message: 'You are not allowed to access this service' };

        await service.edit(req);

        return res.status(200).send({ success: true, service: await service.generateJSON() });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Delete a service */
router.delete('/service/:serviceId', Auth.Root, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const { serviceId } = req.params;
        ModelUtils.ValidId({ serviceId });

        const service = await Service.findOne({ _id: serviceId });
        if (!service) throw { message: 'Unable to find service' };
        if (!ModelUtils.canAccessDocument(req.user, service)) throw { message: 'You are not allowed to access this service' };
        if (!(await service.serviceCanAccess(req.user))) throw { success: false, message: 'You are not allowed to access this service' };

        await service.delete(req);

        return res.status(200).send({ success: true });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

router.post('/service/:serviceId/files', Auth.Employee, Auth.Finally, uploadFilesMiddleware, async (req: Request, res) => {
    const { files } = req;
    const { serviceId } = req.params;
    ModelUtils.ValidId({ serviceId });
    if (!files) return res.status(400).send({ success: false, message: 'No file provided' });

    const service = await Service.findOne({ _id: serviceId });
    if (!service) throw { message: 'Unable to find service' };
    if (!ModelUtils.canAccessDocument(req.user, service)) throw { message: 'You are not allowed to access this service' };
    if (!(await service.serviceCanAccess(req.user))) throw { success: false, message: 'You are not allowed to access this service' };

    await service.edit(req);

    return res.status(200).send({ success: true, files });
});

type FileInfo = {
    name: string;
    url: string;
    id: string;
    type?: string;
};

router.get('/service/:serviceId/files', Auth.User, Auth.Finally, async (req: Request, res) => {
    const { serviceId } = req.params;
    ModelUtils.ValidId({ serviceId });

    const service = await Service.findOne({ _id: serviceId });

    if (!service) throw { message: 'Unable to find service' };
    if (!ModelUtils.canAccessDocument(req.user, service)) throw { message: 'You are not allowed to access this service' };
    if (!(await service.serviceCanAccess(req.user))) throw { success: false, message: 'You are not allowed to access this service' };

    if (!service.files) return res.status(200).send({ success: true, files: [] });

    const bucket = getBucket('services');

    const ids = service.files.map((file) => new ObjectId(file.toString()));

    const files = await bucket.find({ _id: { $in: ids } }).toArray();

    const fileInfos: FileInfo[] = [];
    files.forEach((doc) => {
        fileInfos.push({
            id: doc._id.toString(),
            name: doc.filename,
            url: 'https://fixr-back.nolannbiron.com/' + doc.filename,
            type: doc.contentType,
        });
    });

    return res.status(200).send({ success: true, files: fileInfos });
});

router.get('/service/:serviceId/file/:fileId', Auth.User, Auth.Finally, async (req: Request, res) => {
    const { fileId } = req.params;
    ModelUtils.ValidId({ fileId });

    const bucket = getBucket('services');

    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

    downloadStream.on('data', function (data) {
        return res.status(200).write(data);
    });

    downloadStream.on('error', function () {
        return res.status(404).send({ message: 'Cannot download the Image!' });
    });

    downloadStream.on('end', () => {
        return res.end();
    });
});

// RouterArrayEmployee(router, 'AddModel', {
//     main: { name: 'service' },
//     element: { routeAs: 'opening-hour', as: 'openingHour', name: 'openingHour', arrayPath: 'openingHours' },
//     auth: { add: Auth.Admin, delete: Auth.Admin },
// })

// RouterArrayEmployee(router, 'AddID', {
//     main: { name: 'service' },
//     element: { routeAs: 'client', as: 'clients', name: 'user', arrayPath: 'clients' },
//     auth: { add: Auth.Admin, delete: Auth.Admin },
// })

// RouterArrayEmployee(router, 'AddModel', {
//     main: { name: 'service' },
//     element: { name: 'product', arrayPath: 'products' },
// })

// RouterArrayEmployee(router, 'AddModel', {
//     main: { name: 'service' },
//     element: { name: 'contact', arrayPath: 'contacts' },
// })

export default router;
