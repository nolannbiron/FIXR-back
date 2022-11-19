import mongoose, { Schema } from 'mongoose';
import model from './model';
import { AddressMethods, AddressModel, IAddress } from './types';
import GlobalUtils from '../../../utils/GlobalUtils';
import AddressDefault from './AddressDefault';

const schema = new Schema<IAddress, AddressModel, AddressMethods>(model, { autoCreate: false, _id: false });

GlobalUtils(schema);
AddressDefault(schema);

schema.methods.getModelName = function () {
    return 'addresses';
};

const Address = mongoose.model<IAddress, AddressModel>('addresses', schema);

export default Address;
