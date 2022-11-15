import { UserModel, IUser } from './types';
import mongoose, { Schema } from 'mongoose';
import ModelUtils from '../../utils/ModelsUtils';
import bcrypt from 'bcryptjs';
import { Request } from '../../common';
import User from './User';
import 'dotenv/config';
import LocalCopy from '../LocalCopy/LocalCopy';

const capitalize = (s: string) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

export default function (UserSchema: Schema<IUser, UserModel>) {
    UserSchema.pre('validate', async function (next) {
        next();
    });
    UserSchema.pre(/find/, async function (next) {
        // this.populate('studios')
        next();
    });
    UserSchema.pre('save', async function (next) {
        const user = this;
        if (user.firstName && user.isModified('firstName')) user.firstName = capitalize(user.firstName);
        if (user.lastName && user.isModified('lastName')) user.lastName = user.lastName.toUpperCase();

        next();
    });
    UserSchema.post('save', async function () {
        const user = this;
        if (!user.isNew) {
            await LocalCopy.updateEveryContainers(user, 'update');
        }
    });
    /** ----------------------- Create ----------------------- */
    UserSchema.statics.createUser = async function (user: IUser) {
        return mongoose.model<IUser, UserModel>('user').createModel(user);
    };
    UserSchema.statics.createModel = async function (data: Partial<IUser> & { studioId?: string }) {
        /** Only create model, intern used only */

        if (!data.password) data.password = Math.random().toString(36).substr(2, 8);

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(data.password, salt);
        const _id = new mongoose.Types.ObjectId();
        const user = await ModelUtils.createHandler<UserModel>(
            new User({
                _id: _id.toString(),
                ...(data.studioId ? { studios: [data.studioId] } : {}),
                firstName: data.firstName ? capitalize(data.firstName) : undefined,
                lastName: data.lastName ? data.lastName.toUpperCase() : undefined,
                email: data.email,
                username: data.username,
                phone: data.phone,
                password: hash,
                comment: data.comment ? data.comment : '',
                profile: {
                    permissionLevel: 3,
                },
                socials: data.socials ? data.socials : {},
            }),
        );

        // await confirmAuthEmail(data.email, data.password);

        return user;
    };

    /** ----------------------- Edit ----------------------- */
    UserSchema.methods.edit = async function (req: Request) {
        const { firstName, lastName, email, username, password, phone, comment } = req.body as Partial<IUser>;

        const user = this;

        user.editValue(req, firstName, 'firstName');
        user.editValue(req, lastName, 'lastName');
        user.editValue(req, email, 'email');
        user.editValue(req, username, 'username');
        user.editValue(req, phone, 'phone');
        user.editValue(req, comment, 'comment');

        if (password) {
            const hash = await bcrypt.hash(password, 10);
            user.password = hash;
        }

        await user.save();
    };

    /** ----------------------- Delete ----------------------- */
    UserSchema.statics.delete = async function (req) {
        const { userId } = req.params;
        if (!userId) throw { message: 'Invalid query' };

        const user = await mongoose.model<IUser, UserModel>('user').findOne({ _id: userId });
        if (!user) throw { message: "User doesn't exist" };
        if (!ModelUtils.canAccessDocument(req.user, user)) throw { message: 'Unauthorized' };

        user.delete(req);
    };
    UserSchema.methods.delete = async function () {
        if (this._isDeleted) return;
        this._isDeleted = true;

        if (!(await mongoose.model('user').findOneAndDelete({ _id: this._id }))) throw { message: 'Delete failed' };
    };
}
