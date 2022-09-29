import mongoose, { Schema } from 'mongoose';
import { Socials } from './types';
import { ROOT, ADMIN, USER, OWNER, N, RW } from '../../../utils/modelAccess';

const schema = new Schema<Socials>(
    {
        instagram: {
            type: String,
            required: false,
            access: { [ROOT]: RW, [ADMIN]: RW, [USER]: N, [OWNER]: RW },
        },
        facebook: {
            type: String,
            required: false,
            access: { [ROOT]: RW, [ADMIN]: RW, [USER]: N, [OWNER]: RW },
        },
        twitter: {
            type: String,
            required: false,
            access: { [ROOT]: RW, [ADMIN]: RW, [USER]: N, [OWNER]: RW },
        },
        linkedin: {
            type: String,
            required: false,
            access: { [ROOT]: RW, [ADMIN]: RW, [USER]: N, [OWNER]: RW },
        },
    },
    { _id: false, autoCreate: true },
);

schema.methods.getModelName = function () {
    return 'social';
};

const Social = mongoose.model('social', schema);

export default Social;
