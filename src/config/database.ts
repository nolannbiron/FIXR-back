import 'dotenv/config';

export default {
    dev: {
        url: process.env.DB_URL_DEV,
        config: {
            user: process.env.DB_USER_DEV,
            pass: process.env.DB_PASS_DEV,
        },
    },
    prod: {
        url: process.env.DB_URL_PROD,
        config: {
            user: process.env.DB_USER_PROD,
            pass: process.env.DB_PASS_PROD,
        },
    },
    fullUrl: process.env.DB_FULL_URL,
};
