import { Request } from '../common';

const ROOT = 0;
const ADMIN = 1;
const USER = 3;
const EMPLOYEE = 2;
const OWNER = 'OWNER';

const R = 'R';
const W = 'W';
const RW = R + W;
const N = 'NONE';

const DEFAULT_ACCESS = { [ROOT]: RW, [ADMIN]: RW, [EMPLOYEE]: RW, [USER]: RW };
const DEFAULT_READ = { [ROOT]: R, [ADMIN]: R, [EMPLOYEE]: R, [USER]: R };

const canAccessField = (req: Request, access: any, requestedAccess: any, document: any, key: any) => {
    if (access && req.user) {
        if (typeof access === 'function') return access(req.user, requestedAccess, document[key]);
        else return access[req.user.profile.permissionLevel]?.includes(requestedAccess) || (access[OWNER]?.includes(requestedAccess) && req?.user?.isOwner(document));
    }
    return false;
};

export { ROOT, ADMIN, USER, OWNER, EMPLOYEE, DEFAULT_ACCESS, DEFAULT_READ, R, W, RW, N, canAccessField };
