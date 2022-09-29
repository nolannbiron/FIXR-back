import 'dotenv/config';
console.log('ENV', process.env.NODE_ENV);
import express, { ErrorRequestHandler } from 'express';
const app = express();
import cors from 'cors';
app.use(cors({ origin: true, credentials: true }));

import mongoose from 'mongoose';
import databaseConfig from './src/config/database';
import routes from './src/routers';
const isDevMode = process.env.NODE_ENV === 'development';
mongoose.connect(
    (isDevMode ? databaseConfig.dev.url : databaseConfig.prod.url) ?? '',
    {
        ...(isDevMode ? databaseConfig.dev.config : databaseConfig.prod.config),
    },
    (err) => {
        console.log('mongodb URL: ' + (isDevMode ? databaseConfig.dev.url : databaseConfig.prod.url));
        if (err) console.error('mongoose.connect error: ', err);
    },
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

routes(app);

app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
});

const errorCatcher: ErrorRequestHandler = (err, req, res) => {
    if (!err.status) {
        console.log(err.stack);
    }
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
};
app.use(errorCatcher);

app.listen(process.env.PORT);
console.log('PORT', process.env.PORT);
