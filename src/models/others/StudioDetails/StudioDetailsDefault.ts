import { Schema } from 'mongoose';
import { Request } from '../../../common';
import { IStudioDetails, StudioDetailsModel } from './types';

export default function (StudioDetailsSchema: Schema<IStudioDetails, StudioDetailsModel>) {
    // StudioDetailsSchema.pre('validate', async function (next) {
    //     // const studio = this
    //     next();
    // });
    // StudioDetailsSchema.pre('save', async function (next) {
    //     // const studio = this

    //     next();
    // });

    /** ----------------------- Edit ----------------------- */
    StudioDetailsSchema.methods.edit = async function (req: Request) {
        const studioDetails = this;
        const { rules, extras } = req.body.details;

        studioDetails.rules.edit(rules);
        studioDetails.extras = extras;
    };
}
