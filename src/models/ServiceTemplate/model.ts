import mongoose from 'mongoose';

export default {
    name: {
        type: String,
        required: true,
    },
    studio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'studio',
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['physical', 'digital'],
        required: true,
    },
    _isDeleted: {
        type: Boolean,
        default: false,
    },
};
