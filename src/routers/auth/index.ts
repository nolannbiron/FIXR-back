import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request } from '../../common';
import User from '../../models/User/User';
import express, { Response } from 'express';
import Auth from '../../middleware/auth';
const router = express.Router();

router.post('/account', async (req: Request, res: Response) => {
    try {
        const user = await User.createUser(req.body);
        if (!user) throw new Error('Unable to create user');
        return res.status(201).send({
            success: true,
            user: user.generateJSON(),
        });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

router.post('/admin/login', async (req: Request, res: Response) => {
    const { password, email } = req.body;

    const query = email.includes('@') ? { email } : { username: email };

    const user = await User.findOne(query);

    if (!user) {
        return res.status(404).send({ success: false, message: 'User not found' });
    }

    if (user.profile.permissionLevel >= 3) return res.status(401).send({ success: false, message: 'User is not an admin' });

    bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
            const payload = {
                id: user.id,
                name: user.firstName,
                username: user.username,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET ?? '', {
                expiresIn: '15d',
            });

            const refreshToken = jwt.sign(payload, process.env.JWT_SECRET ?? '', {
                expiresIn: '30d',
            });

            res.status(200).send({
                success: true,
                user: user.generateJSON(),
                token: token,
                refreshToken: refreshToken,
            });
        } else {
            return res.status(400).send({ success: false, message: 'Password incorrect' });
        }
    });
});

router.post('/account/login', async (req: Request, res: Response) => {
    const { password, email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).send({ success: false, message: 'User not found' });
    }

    bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
            const payload = {
                id: user.id,
                name: user.firstName,
                username: user.username,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET ?? '', {
                expiresIn: '15d',
            });

            const refreshToken = jwt.sign(payload, process.env.JWT_SECRET ?? '', {
                expiresIn: '30d',
            });

            res.status(200).send({
                success: true,
                user: user.generateJSON(),
                token: token,
                refreshToken: refreshToken,
            });
        } else {
            return res.status(400).send({ success: false, message: 'Password incorrect' });
        }
    });
});

router.get('/account', Auth.User, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const { user } = req;

        if (!user) throw new Error('User not found');

        return res.status(200).send({ success: true, user: user.generateJSON() });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/** Edit self account */
router.patch('/account', Auth.User, Auth.Finally, async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) throw new Error('User not found');

        user.edit(req);

        return res.status(200).send({ success: true, user: user.generateJSON() });
    } catch (error) {
        Auth.ErrorHandler(req, res, error);
    }
});

/** Refresh Token */
// router.post('/account/refresh-token', async (req: Request, res: Response) => {
//     try {
//         const { refreshToken } = req.body
//         if (!refreshToken) throw { message: 'Missing refreshToken in body' }

//         const data = jwt.verify(refreshToken, process.env.JWT_SECRET ?? '')
//         if (!data) throw { message: 'Invalid refresh token' }

//         const user = await User.findOne({
//             _id: typeof data === 'string' ? data : data._id,
//         })
//         if (!user) throw { message: 'Invalid token' }

//         const auth = await refreshToken(req, user)
//         await user.save()

//         req.user = user

//         return res.status(200).send({ success: true, user: { ...user, ...auth } })
//     } catch (error) {
//         Auth.ErrorHandler(req, res, error)
//     }
// })

/** Change picture */
// router.post('/account/picture', Auth.User, Auth.Finally, async (req: Request, res: Response) => {
//     try {
//         const {user} = req

//         const onFile = (field, file) => {
//             if (file) return file
//         }
//         const onEnd = async (picture) => {
//             if (!picture) throw new Error({ success: false, message: 'Invalid picture' }
//             const path = moveFileToSubFolder(__picturePath, picture.path)
//             if (!path) throw new Error({ success: false, message: 'moveFileToSubFolder failed' }

//             if (user.picture) await user.deletePicture({ save: false })
//             user.picture = path
//             await user.save()
//             return res.status(200).sendFile(__picturePath + __readPath(user.picture))
//         }
//         const formHandler = new FormHandler(onFile.bind(this), onEnd.bind(this))
//         const options = { multiples: false, uploadDir: __tmpPath }
//         formHandler.runForm(options, req, res)
//     } catch (error) {
//         Auth.ErrorHandler(req, res, error)
//     }
// })

// /** Get picture of an account */
// router.get('/account/picture', Auth.User, Auth.Finally, async (req: Request, res: Response) => {
//     try {
//         const { user } = req
//         if (!user.picture) return res.status(200).send({ success: true, data: null, message: 'No picture found' })
//         return res.status(200).sendFile(__picturePath + __readPath(user.picture))
//     } catch (error) {
//         Auth.ErrorHandler(req, res, error)
//     }
// })

// /** Delete picture of an account */
// router.delete('/account/picture', Auth.User, Auth.Finally, async (req: Request, res: Response) => {
//     try {
//         const { user } = req

//         await user.deletePicture()

//         return res.status(200).send({ success: true })
//     } catch (error) {
//         Auth.ErrorHandler(req, res, error)
//     }
// })

/** Log user out of the application */
// router.post('/account/disconnect', Auth.User, Auth.Finally, async (req: Request, res: Response) => {
//     try {
//         const device = req.user.auth.findDevice(req?.device?.type)
//         if (!device) throw new Error({ success: false, message: 'Unable to find device' })

//         device.disconnect()

//         await req.user.save()
//         return res.status(200).send({ success: true, message: 'Successfully logout' })
//     } catch (error) {
//         Auth.ErrorHandler(req, res, error)
//     }
// })

/** Delete account */
// router.delete('/account', Auth.User, Auth.Finally, async (req: Request, res: Response) => {
//     try {
//         await req.user.delete()
//         return res.status(200).send({ success: true, message: 'Successfully deleted' })
//     } catch (error) {
//         Auth.ErrorHandler(req, res, error)
//     }
// })

export default router;
