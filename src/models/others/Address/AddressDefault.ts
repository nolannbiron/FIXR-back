import { Schema } from 'mongoose';
import { Request } from '../../../common';
import { IAddress, AddressModel } from './types';

export default function (AddressSchema: Schema<IAddress, AddressModel>) {
    // AddressSchema.pre('validate', async function (next) {
    //     // const studio = this
    //     next();
    // });
    // AddressSchema.pre('save', async function (next) {
    //     // const studio = this

    //     next();
    // });

    /** ----------------------- Edit ----------------------- */
    AddressSchema.methods.edit = async function (req: Request) {
        const addressModel = this;
        const { city, country, street, postalCode, streetNumber, coordinates } = req.body.address;

        addressModel.editValue(req, city, 'city');
        addressModel.editValue(req, country, 'country');
        addressModel.editValue(req, street, 'street');
        addressModel.editValue(req, postalCode, 'postalCode');
        addressModel.editValue(req, streetNumber, 'streetNumber');
        addressModel.editValue(req, coordinates, 'coordinates');
    };
}
