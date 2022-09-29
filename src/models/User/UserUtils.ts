import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { Schema } from 'mongoose';
import { IUser, UserModel } from './types';
import { createQueryStudios } from '../../utils/RouterUtils';
import AggregateUtils from '../../utils/AggregateUtils';
import User from './User';
import ModelUtils from '../../utils/ModelsUtils';

/** Possibility to have better performance by moving countDetails & countTotalValue inside filterSales */
export async function filterArtists(req: any) {
    const defaultQuery = createQueryStudios(req, { typeName: 'studios' });

    const aggregateUtils = new AggregateUtils(User, req, defaultQuery, {
        overideMaximumAmount: 230,
    });
    await aggregateUtils.launch();
    return aggregateUtils.formatResult('artists');
}

export default function (UserSchema: Schema<IUser, UserModel>) {
    UserSchema.methods.hasStudio = function (studioId: string) {
        const user = this;

        if (user.profile.permissionLevel === 0) return true;
        return user.studios.some((studio: string) => ModelUtils.isEq(studio, studioId));
    };

    UserSchema.methods.isOwner = function (document: any) {
        const user = this;

        if (!document) return false;
        return (
            (document?.constructor?.modelName === 'user' && ModelUtils.isEq(document._id, user._id)) || (document?.constructor?.modelName === 'service' && ModelUtils.isEq(document.owner, user._id))
        );
    };

    UserSchema.methods.generateAuthToken = async function (opts = { save: true }) {
        const user = this;
        user.auth.token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET ?? ''); // { expiresIn: '2000h' /*'15m'*/ } 2k hour only for dev purpose
        user.auth.connexionDate = new Date().getTime();
        if (opts.save) await user.save();
        return user.auth.token;
    };

    UserSchema.methods.generateAuthRefreshToken = async function (opts = { save: true }) {
        const user = this;
        user.auth.refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET ?? ''); // set expire to 1 month ?
        if (opts.save) await user.save();
        return user.auth.refreshToken;
    };

    UserSchema.methods.kick = async function (opts = { save: true }) {
        const user = this;

        user.auth.token = undefined;
        user.auth.refreshToken = undefined;
        if (opts.save) await user.save();
    };

    UserSchema.statics.serviceArtistQuery = function (studios) {
        if (!Array.isArray(studios)) studios = [];
        return {
            $and: [
                {
                    $or: [{ 'profile.permissionLevel': { $lt: 2 } }],
                },
                {
                    $or: [{ studios: { $in: studios } }, { 'profile.permissionLevel': 0 }],
                },
            ],
        };
    };

    UserSchema.methods.generateJSON = function () {
        const user = this;
        return {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            phone: user.phone,
            comment: user.comment,
            socials: user.socials,
            studios: user.studios,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            profile: user.profile,
        };
    };
}
