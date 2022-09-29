import { ROOT, ADMIN, USER, OWNER, R, RW, N } from '../../utils/modelAccess';
import Social from '../others/Socials/Socials';
import mongoose from 'mongoose';
import UserProfile from '../others/UserProfile/UserProfile';

export default {
    firstName: {
        type: String,
        required: true,
        // access: { [ROOT]: RW, [ADMIN]: RW, [USER]: R, [OWNER]: RW },
    },
    lastName: {
        type: String,
        required: true,
        // access: { [ROOT]: RW, [ADMIN]: R, [USER]: R, [OWNER]: RW },
    },
    username: {
        type: String,
        required: true,
        unique: true,
        // access: { [ROOT]: RW, [ADMIN]: R, [USER]: R, [OWNER]: RW },
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // access: { [ROOT]: RW, [ADMIN]: R, [USER]: R, [OWNER]: RW },
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        // access: { [ROOT]: RW, [ADMIN]: R, [USER]: R, [OWNER]: RW },
    },
    password: {
        type: String,
        required: true,
        // access: { [ROOT]: RW, [ADMIN]: RW, [USER]: R, [OWNER]: RW },
    },
    comment: {
        type: String,
        default: '',
        // access: { [ROOT]: RW, [ADMIN]: RW, [USER]: N, [OWNER]: RW },
    },
    socials: {
        type: Social.schema,
        default: {},
        required: false,
        // access: { [ROOT]: RW, [ADMIN]: RW, [USER]: R, [OWNER]: RW },
    },
    studios: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'studio',
        // access: { [ROOT]: RW, [ADMIN]: RW, [USER]: N, [OWNER]: RW },
    },
    profile: {
        type: UserProfile.schema,
        // access: { [ROOT]: RW, [ADMIN]: RW, [USER]: R, [OWNER]: RW },
    },
    favorites: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'user',
        // access: { [ROOT]: RW, [ADMIN]: RW, [USER]: R, [OWNER]: RW },
    },
};
