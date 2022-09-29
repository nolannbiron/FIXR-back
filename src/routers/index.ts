import { Express } from 'express';
import account from './auth';
import artistRoutes from './artists';
import studioRoutes from './studios';
import serviceTemplatesRoutes from './serviceTemplates';
import serviceRoutes from './services';

export default function routes(express: Express) {
    express.use('/v1', account);
    express.use('/v1', artistRoutes);
    express.use('/v1', studioRoutes);
    express.use('/v1', serviceTemplatesRoutes);
    express.use('/v1', serviceRoutes);
}
