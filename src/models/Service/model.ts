import { IService } from './types';
import mongoose from 'mongoose';
import LocalCopy from '../LocalCopy/LocalCopy';
// import Comment from '../others/Comments/Comments';

export default {
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'serviceTemplate',
        required: true,
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false,
    },
    studio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'studio',
        required: true,
    },
    comment: {
        type: String,
        default: '',
        required: false,
    },
    type: {
        type: String,
        enum: ['physical', 'digital'],
    },
    date: {
        type: Date,
        required: function (this: IService) {
            return this.type === 'physical';
        },
    },
    status: {
        type: String,
        enum: ['pending', 'done', 'incoming'],
        default: function (this: IService) {
            return this.type === 'physical' ? 'incoming' : 'pending';
        },
        required: true,
    },
    localCopies: {
        type: [LocalCopy.schema],
        default: [],
    },
    files: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'services',
        default: [],
    },
};
