import mongoose, { Schema } from 'mongoose';
import { IUser, UserMethods, UserModel } from './types';
import model from './model';
import UserDefault from './UserDefault';
import DefaultUtils from '../../utils/GlobalUtils';
import UserUtils from './UserUtils';
import UserAggregate from './UserAggregate';

const schema = new Schema<IUser, UserModel, UserMethods>(model, { timestamps: true });

DefaultUtils(schema);
UserAggregate(schema);
UserUtils(schema);
UserDefault(schema);

schema.methods.getModelName = function () {
    return 'user';
};

const User = mongoose.model<IUser, UserModel>('user', schema);

export default User;
