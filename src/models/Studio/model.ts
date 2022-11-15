import { Schema } from 'mongoose';
import Pictures from '../others/Pictures/Pictures';
import StudioSettings from '../others/StudioSettings/StudioSettings';

export default {
    users: {
        type: [Schema.Types.ObjectId],
        ref: 'user',
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    employees: {
        type: [Schema.Types.ObjectId],
        ref: 'user',
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
    },
    settings: {
        type: StudioSettings.schema,
        default: {},
    },
    pictures: {
        type: [Pictures.schema],
        ref: 'pictures',
        default: [],
    },
    adminToken: {
        type: String,
    },
    userToken: {
        type: String,
    },
};
