import util from 'util';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import dbConfig from '../config/database';

const storage = new GridFsStorage({
    url: dbConfig.fullUrl || '',
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        const match = ['audio/mpeg', 'audio/mp3'];

        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}-FIXR-${file.originalname}`;
            return filename;
        }

        return {
            bucketName: 'services',
            filename: `${Date.now()}-FIXR-${file.originalname}`,
        };
    },
});

const uploadFiles = multer({ storage: storage }).array('file', 5);
const uploadFilesMiddleware = util.promisify(uploadFiles);
export default uploadFilesMiddleware;
