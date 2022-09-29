import express, { Response } from 'express';
import { Request } from '../../common';
import Auth from '../../middleware/auth';
import User from '../../models/User/User';
import { filterArtists } from '../../models/User/UserUtils';
import ModelUtils, { canAccessDocument } from '../../utils/ModelsUtils';

// const { filterUsers } = require('../routers-utils/userUtils')
// const RouterArray = require('../utils/RouterArray')

const router = express.Router();

router.post('/artist', async (req: Request, res: Response) => {
    try {
        const user = await User.createUser(req.body);
        if (!user) throw new Error('Unable to create user');
        return res.status(201).send({
            success: true,
            artist: user.generateJSON(),
        });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Get a list of all users */
router.get('/studio/:studioId/artists', Auth.Admin, Auth.Finally, async (req: Request, res: Response) => {
    try {
        req.query.studios = req.params.studioId;
        res.status(200).send({ success: true, ...(await filterArtists(req)) });
        return;
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

router.get('/artists', Auth.User, Auth.Finally, async (req: Request, res: Response) => {
    try {
        res.status(200).send({ success: true, ...(await filterArtists(req)) });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Get specific user informations */
router.get('/artist/:artistId', Auth.Admin, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const { artistId } = req.params;
        ModelUtils.ValidId({ artistId });

        if (!req.user) throw new Error('User not found');

        const user = await User.findOne({ _id: artistId });
        if (!user) throw new Error('Unable to find user');
        if (!canAccessDocument(req.user, user)) throw { message: 'You are not allowed to access this user' };

        res.status(200).send({ success: true, artist: user });
        return;
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Edit specific user informations */
router.patch('/artist/:userId', Auth.Admin, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        ModelUtils.ValidId({ userId });

        if (!req.user) throw new Error('User not found');

        const user = await User.findOne({ _id: userId });
        if (!user) throw { message: 'Unable to find user' };
        if (!canAccessDocument(req.user, user)) throw { message: 'Unauthorized' };

        console.log('edit', req);

        await user.edit(req);

        res.status(200).send({ success: true, artist: user });
        return;
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Get user picture */
router.get('/artist/:artistId/picture', Auth.Admin, Auth.Finally, async (req, res) => {
    try {
        // const { artistId } = req.params
        // const user = await User.findOne({ _id: artistId })
        // if (!user) throw ({ success: false, message: 'Invalid user' }
        // if (!ModelUtils.canAccessDocument(req.user, user)) throw new Error({ success: false, message: __msg.unauthorized }
        // if (user.picture) return res.status(200).sendFile(__picturePath + __readPath(user.picture))
        // throw new Error({ success: false, message: 'No picture found' }
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/* Delete user */
router.delete('/artist/:artistId', Auth.Admin, Auth.Finally, async (req, res) => {
    try {
        const { artistId } = req.params;
        ModelUtils.ValidId({ artistId });
        await User.deleteOne({ _id: artistId });
        res.status(200).send({ success: true });
        return;
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

export default router;
