import type { ITariff } from './tariff';

export interface IUser {
    _id?: string;
    userId: string;
    avatar?: string;
    firstName: string;
    lastName?: string;
    username?: string;
    phoneNumber?: string;
    premium: boolean;
    verified: boolean;
    active: boolean;
    balance: number;
    startedAt?: string | Date;
    referrerId?: string;
    tariff?: ITariff | null;
    tariffExpireAt?: string | Date;
    role: 'admin' | 'driver' | 'customer';
    regionSlug?: string | null;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
