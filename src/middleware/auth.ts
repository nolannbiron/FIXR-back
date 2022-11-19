import { IUser } from './../models/User/types';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Request } from '../common';
import { Response } from 'express';
import { isEq } from '../utils/ModelsUtils';
import { UserModel } from '../models/User/types';

const setAuthPath = (req: Request, type: 'user' | 'admin') => {
    req.authPath = type;
};
const setAuthType = (req: Request, type: string) => {
    req.authType = type;
};

const ErrorHandler = (req: Request, res: Response, error: any) => {
    console.log(error);
    try {
        if (error !== undefined) {
            if (error.name === 'TokenExpiredError') return res.status(401).send({ success: false, message: 'Expired Token' });
            if (error.name === 'JsonWebTokenError') return res.status(401).send({ success: false, message: 'Unauthorized' });
            // if (error.message === __msg.invalidToken) return res.status(401).send(error)
            // if (error.message === __msg.unauthorized) return res.status(403).send(error)
            // if ('boolean' === typeof error.success) return res.status(400).send(error)
            if (error.errors && error.errors.type && error.errors.type.properties && error.errors.type.properties.path)
                return res.status(400).send({ success: false, message: 'Invalid value at path : ' + error.errors.type.properties.path });
            if (error.errors && Array.isArray(Object.keys(error.errors)) && typeof Object.keys(error.errors)[0] === 'string')
                return res.status(400).send({
                    success: false,
                    message: 'Invalid body: field ' + Object.keys(error.errors)[0] + ' is invalid',
                });
        }
    } catch (error) {
        console.log(error);
        console.log('Internal error', error);
    }
    return res.status(400).send({
        success: false,
        error: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ? error : undefined,
    });
};

const Token = async (req: Request, res: Response, next: () => void) => {
    try {
        const authorization = req.header('Authorization');
        if (!authorization) throw { message: 'Unauthorized' };
        const token = authorization.split(' ')[1];
        if (!token) throw { message: 'Invalid token' };
        const data = jwt.verify(token, process.env.JWT_SECRET ?? '');
        if (!data) throw { message: 'Invalid token' };
        req.authToken = { id: typeof data === 'string' ? data : data.id, data: token };

        next();
    } catch (error: unknown) {
        return ErrorHandler(req, res, error);
    }
};

const User = async (req: Request, res: Response, next: () => void) => {
    const callback = async () => {
        try {
            setAuthPath(req, 'user');

            if (!req.authToken) throw new Error('Internal error : Token middleware not called');

            const user = await mongoose.model<IUser, UserModel>('user').findOne({
                _id: req.authToken.id,
            });

            if (user) {
                req.user = user;
                setAuthType(req, 'user');
            }

            next();
        } catch (error) {
            return ErrorHandler(req, res, error);
        }
    };
    Token(req, res, callback);
};

const UserSelf = async (req: Request, res: Response, next: () => void) => {
    /** Only available for /user/:userId/ routes */
    const callback = async () => {
        try {
            if (req.user && (!req.user.profile || req.user.profile.permissionLevel > 2) && !isEq(req.user._id, req.params.id)) throw new Error('Unauthorized');
            next();
        } catch (error) {
            return ErrorHandler(req, res, error);
        }
    };
    User(req, res, callback);
};

const Admin = async (req: Request, res: Response, next: () => void) => {
    const callback = async () => {
        try {
            if (req.user && (!req.user.profile || req.user.profile.permissionLevel > 1)) throw new Error('Unauthorized');
            next();
        } catch (error) {
            return ErrorHandler(req, res, error);
        }
    };
    User(req, res, callback);
};

const Employee = async (req: Request, res: Response, next: () => void) => {
    const callback = async () => {
        try {
            if (req.user && (!req.user.profile || req.user.profile.permissionLevel > 2)) throw new Error('Unauthorized');
            next();
        } catch (error) {
            return ErrorHandler(req, res, error);
        }
    };
    User(req, res, callback);
};

const Root = async (req: Request, res: Response, next: () => void) => {
    const callback = async () => {
        try {
            if (req.user && (!req.user.profile || req.user.profile.permissionLevel !== 0)) throw new Error('Unauthorized');
            next();
        } catch (error) {
            return ErrorHandler(req, res, error);
        }
    };
    User(req, res, callback);
};

const Finally = (req: Request, res: Response, next: () => void) => {
    try {
        if (req.authPath === 'user' && !req.user) throw new Error('Unauthorized');

        next();
    } catch (error) {
        return ErrorHandler(req, res, error);
    }
};

const Auth = {
    Token,
    User,
    Employee,
    UserSelf /** Only for /user/:userId routes */,
    Admin,
    Root,
    ErrorHandler,
    Finally,
};

export default Auth;
