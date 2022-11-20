import mongoose, { Schema } from 'mongoose';
import { Request } from '../../../common';
import ModelUtils from '../../../utils/ModelsUtils';
import Details from './Details';
import { IDetails, DetailsModel } from './types';

export default function (DetailsSchema: Schema<IDetails, DetailsModel>) {
    // DetailsSchema.pre('validate', async function (next) {
    //     // const  = this
    //     next();
    // });
    // DetailsSchema.pre('save', async function (next) {
    //     // const  = this

    //     next();
    // });

    /** ----------------------- Create ----------------------- */
    DetailsSchema.statics.createDetails = async function (req) {
        /** Handle req, used by routers */
        const body = req.body;

        return mongoose.model<IDetails, DetailsModel>('studio').createModel({
            ...body,
        });
    };
    DetailsSchema.statics.createModel = async function (data: IDetails) {
        /** Only create model, intern used only */
        const id = new mongoose.Types.ObjectId();

        console.log(data);

        const details = await ModelUtils.createHandler(
            new Details({
                _id: id,
                data: data.data,
            }),
        );
        /** Studio post created */
        if (details) {
            // const user = await mongoose.model<IStudio>('studios').findOne({ _id: data. });
            // if (!user) throw new Error('Studio invalid owner');
            // user.studios.push(studio.id);
            // await user.save();
        }

        return details;
    };
    /** ----------------------- Edit ----------------------- */
    DetailsSchema.methods.edit = async function (req: Request) {
        const details = this;

        details.data = req.body.data;

        await details.save();
    };
}
