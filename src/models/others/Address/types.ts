import { Model } from 'mongoose';

export interface IAddress {
    fullName?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    street?: string;
    streetNumber?: string;
    coordinates?: number[];
}

export type Address = Omit<IAddress, '_id'> & { _id?: string };

export interface AddressMethods {
    edit: (req: Request) => Promise<IAddress>;
}

export type AddressModel = Model<IAddress, Record<string, unknown>, AddressMethods>;
