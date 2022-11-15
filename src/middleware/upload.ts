import util from 'util';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3 } from '../utils/Bucket';
// import { GridFsStorage } from 'multer-gridfs-storage';
// import dbConfig from '../config/database';

// const storage = new GridFsStorage({
//     url: dbConfig.fullUrl || '',
//     options: { useNewUrlParser: true, useUnifiedTopology: true },
//     file: (req, file) => {
//         const match = ['audio/mpeg', 'audio/mp3', 'image/png', 'image/jpeg', 'image/jpg'];

//         if (match.indexOf(file.mimetype) === -1) {
//             const filename = `${Date.now()}-FIXR-${file.originalname}`;
//             return filename;
//         }

//         if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
//             return {
//                 bucketName: 'services',
//                 filename: `${Date.now()}-FIXR-${file.originalname}`,
//             };
//         }

//         return {
//             bucketName: 'studios',
//             filename: `${Date.now()}-FIXR-${file.originalname}`,
//         };
//     },
// });

const storageServices = multerS3({
    s3: s3,
    bucket: 'services.files',
    acl: 'public-read',
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    },
});

const storageStudios = multerS3({
    s3: s3,
    bucket: 'studios.pictures',
    acl: 'public-read',
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    },
});

const uploadFiles = multer({ storage: storageServices }).array('file', 5);
const uploadPictures = multer({ storage: storageStudios }).array('picture', 5);
export const uploadFilesMiddleware = util.promisify(uploadFiles);
export const uploadPicturesMiddleware = util.promisify(uploadPictures);
