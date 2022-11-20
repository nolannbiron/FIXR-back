import { Schema } from 'mongoose';
import { Request } from '../../../common';
import { IDetails, DetailsModel } from './types';

export default function (DetailsSchema: Schema<IDetails, DetailsModel>) {
    DetailsSchema.methods.generateJSON = async function (req: Request) {
        const details = this;
        return await details.generateJSON_(req);
    };
}
