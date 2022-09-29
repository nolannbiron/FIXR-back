import mongoose from 'mongoose';
// import { DEFAULT_ACCESS, ROOT, ADMIN, USER, R, W, RW } from '../../utils/modelAccess';

const model = {
    modelName: {
        type: String,
        enum: ['user', 'serviceTemplate'],
        required: true,
    },
    model: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'modelName',
        required: true,
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
};

export default model;
