import mongoose, { Schema } from 'mongoose';

/** Only one by user */
const UserProfileSchema = new Schema(
    {
        permissionLevel: {
            type: Number,
            min: 0,
            max: 3,
            default: 2,
        },
    },
    { _id: false, autoCreate: true },
);

UserProfileSchema.methods.getModelName = function () {
    return 'userProfile';
};
const UserProfile = mongoose.model('userProfile', UserProfileSchema);

export default UserProfile;
