export interface ITariff {
    _id?: string;
    name: string;
    info?: string;
    icon?: string;
    badge?: string;
    price: number;
    expireDays: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
