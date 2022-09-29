import { IStudio, StudioModel } from './../../models/Studio/types';
import express, { Response } from 'express';
import Auth from '../../middleware/auth';
import ModelUtils from '../../utils/ModelsUtils';
import mongoose from 'mongoose';
import Studio from '../../models/Studio/Studio';
import jwt from 'jsonwebtoken';
import { Request } from '../../common';
import { filterStudios } from '../../models/Studio/StudioUtils';

const router = express.Router();

/* Get a list of all studios */
// router.get('/studios', Auth.Employee, Auth.Finally, async (req: Request, res: Response) => {
//     try {
//         return res.status(200).send({ success: true, ...(await filterStudios(req)) });
//     } catch (error) {
//         Auth.ErrorHandler(req, res, error);
//     }
// });

router.get('/studios', Auth.Employee, Auth.Finally, async (req: Request, res: Response) => {
    try {
        return res.status(200).send({ success: true, studios: Studio.find({ _id: { $in: req.user?.studios } }) });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Create a studio */
router.post('/studio', Auth.Root, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const studio = await Studio.createStudio(req);
        return res.status(201).send({ success: true, studio: await studio.generateJSON() });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Get specific studio informations */
router.get('/studio/:studioId', Auth.User, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const { studioId } = req.params;
        ModelUtils.ValidId({ studioId });

        console.log(studioId);

        const studio = await Studio.findOne({ _id: studioId });
        if (!studio) throw { message: 'Unable to find studio' };
        if (!ModelUtils.canAccessDocument(req.user, studio)) throw { message: 'You are not allowed to access this studio' };

        return res.status(200).send({ success: true, studio: await studio.generateJSON() });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Get specific studio informations with token */
router.get('/studio/token/:registerToken', async (req: Request, res: Response) => {
    try {
        const { registerToken } = req.params;

        if (!registerToken) throw { message: 'registerToken is required to create a new user' };
        const data = jwt.verify(registerToken, process.env.JWT_SECRET ?? '');

        const studio = await Studio.findOne({ $or: [{ userToken: registerToken }, { adminToken: registerToken }] });
        if (!studio || !ModelUtils.isEq(typeof data === 'string' ? data : data._id, studio._id)) throw { message: 'Invalid param registerToken' };

        return res.status(200).send({
            success: true,
            studio: {
                id: studio._id,
                name: studio.name,
            },
        });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Edit a studio */
router.patch('/studio/:studioId', Auth.Admin, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const { studioId } = req.params;
        ModelUtils.ValidId({ studioId });

        const studio = await Studio.findOne({ _id: studioId });
        console.log(req.user, studio);
        if (!studio) throw { message: 'Unable to find studio' };
        if (!ModelUtils.canAccessDocument(req.user, studio)) throw { message: 'You are not allowed to access this studio' };

        await studio.edit(req);

        return res.status(200).send({ success: true, studio: await studio.generateJSON() });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Generate new user/admin token of a studio */
router.post('/studio/:studioId/token', Auth.Admin, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const { studioId } = req.params;
        const { type } = req.body;
        ModelUtils.ValidId({ studioId });

        if (!type || !Studio.isValidTokenType(type)) throw { message: 'Invalid query type' };
        const studio = await Studio.findOne({ _id: studioId });
        if (!studio) throw { message: 'Unable to find studio' };
        if (!ModelUtils.canAccessDocument(req.user, studio)) throw { message: 'You are not allowed to access this studio' };

        studio[type as 'adminToken' | 'userToken'] = await mongoose.model<IStudio, StudioModel>('studio').generateToken(studio._id, type === 'adminToken');
        await studio.save();

        return res.status(200).send({ success: true, studio: await studio.generateJSON() });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Delete a studio */
router.delete('/studio/:studioId', Auth.Root, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const { studioId } = req.params;
        ModelUtils.ValidId({ studioId });

        const studio = await Studio.findOne({ _id: studioId });
        if (!studio) throw { message: 'Unable to find studio' };

        await studio.delete(req);

        return res.status(200).send({ success: true });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

// RouterArrayEmployee(router, 'AddModel', {
//     main: { name: 'studio' },
//     element: { routeAs: 'opening-hour', as: 'openingHour', name: 'openingHour', arrayPath: 'openingHours' },
//     auth: { add: Auth.Admin, delete: Auth.Admin },
// })

// RouterArrayEmployee(router, 'AddID', {
//     main: { name: 'studio' },
//     element: { routeAs: 'client', as: 'clients', name: 'user', arrayPath: 'clients' },
//     auth: { add: Auth.Admin, delete: Auth.Admin },
// })

// RouterArrayEmployee(router, 'AddModel', {
//     main: { name: 'studio' },
//     element: { name: 'product', arrayPath: 'products' },
// })

// RouterArrayEmployee(router, 'AddModel', {
//     main: { name: 'studio' },
//     element: { name: 'contact', arrayPath: 'contacts' },
// })

export default router;
