import { BaseModel } from "src/app/shared/models/base-model";

export interface DriverModel extends BaseModel {
    name?: string;
    full_name?: string;
    contry_code?: string;
    firstName?: string;
    email?: string;
    lastName?: string;
    citizenship?: string;
    password?: string;
    phoneNumbers?: any[];
    driverTransports?: any[],
    phoneNumber?: string;
    phone?: string;
    type?: string;
    moderation?: string;
    register_date?: Date;
    last_enter?: Date;
    order?: boolean;
    geolocation?: boolean;
    subscribedAt?: string;
    subscription?: any;
    driverLicense?: string;
    passport?: string;
    blocked?: boolean;
    passportFilePath: string;
    driverLicenseFilePath: string;
    isBusy?: boolean;
    canceledOrdersCount: number;
    isVerified: boolean;
    profileFile?: string;
    isKzPaidWay: boolean;
    isOwnBalance: boolean;
    isOwnOrder: boolean;
    isOwnService: boolean;
    isOwnTirgoBalance: boolean;
    serviceBalance: number;
    tirgoBalance: number;
    isSubscribed: boolean;
    subscribedTill
    user: {
        id: number;
        lastLogin: Date;
    }
    // driverMerchant?:MerchantModel;
}