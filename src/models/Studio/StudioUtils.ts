import { Schema } from 'mongoose';
import { Request } from '../../common';
import { IStudio, StudioModel } from './types';

import jwt from 'jsonwebtoken';
import { createQueryStudios } from '../../utils/RouterUtils';
import AggregateUtils from '../../utils/AggregateUtils';
import Studio from './Studio';

export async function filterStudios(req: Request) {
    const defaultQuery = createQueryStudios(req, { typeName: '_id' });

    const aggregateUtils = new AggregateUtils(Studio, req, defaultQuery);
    await aggregateUtils.launch();
    return aggregateUtils.formatResult('studios');
}

export default function (StudioSchema: Schema<IStudio, StudioModel>) {
    StudioSchema.methods.generateJSON = async function (req: Request) {
        const studio = this;
        return await studio.generateJSON_(req);
    };

    StudioSchema.statics.generateToken = async function (id: string, admin = false) {
        if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');

        return jwt.sign({ _id: id, iat: new Date().getTime(), admin }, process.env.JWT_SECRET, {
            expiresIn: '2400h',
        });
    };

    StudioSchema.statics.isValidTokenType = async function (type) {
        return ['userToken', 'adminToken'].includes(type);
    };
}
