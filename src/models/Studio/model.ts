import { Schema } from 'mongoose';

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
    phone: {
        type: String,
    },
    adminToken: {
        type: String,
    },
    userToken: {
        type: String,
    },
};
