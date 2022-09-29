import { IUser, UserModel } from './../models/User/types';
import 'dotenv/config';
console.log('ENV', process.env.NODE_ENV);
import { faker } from '@faker-js/faker';

import mongoose, { model } from 'mongoose';
import databaseConfig from '../config/database';
import User from '../models/User/User';
import LocalCopy from '../models/LocalCopy/LocalCopy';
import('../models/Service/Service');
const isDevMode = process.env.NODE_ENV === 'development';

const init = async () => {
    await User.deleteMany({ socials: { $exists: true } });

    [...Array(200)].map(async () => {
        const user = new User({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            username: faker.internet.userName(),
            email: faker.internet.email(),
            phone: faker.phone.number('+33########'),
            password: faker.internet.password(),
            comment: faker.lorem.paragraph(2),
            profile: {
                permissionLevel: 2,
            },
            socials: {
                facebook: faker.internet.url(),
                instagram: faker.internet.url(),
                twitter: faker.internet.url(),
                website: faker.internet.url(),
                linkedin: faker.internet.url(),
            },
            studios: ['631e584d761a1b0df44f8fea'],
        });

        console.log('user', user.id);

        await user.save();
    });
};

const updateLocalCopy = async () => {
    await mongoose.connect(
        (isDevMode ? databaseConfig.dev.url : databaseConfig.prod.url) ?? '',
        {
            ...(isDevMode ? databaseConfig.dev.config : databaseConfig.prod.config),
        },
        (err) => {
            console.log('mongodb URL: ' + (isDevMode ? databaseConfig.dev.url : databaseConfig.prod.url));
            if (err) console.error('mongoose.connect error: ', err);
        },
    );
    const users = await mongoose.model<IUser, UserModel>('user').find();
    for (const user of users) {
        await LocalCopy.updateEveryContainers(user, 'update');
    }
    console.log(await LocalCopy.find());
};

// init();
updateLocalCopy();
