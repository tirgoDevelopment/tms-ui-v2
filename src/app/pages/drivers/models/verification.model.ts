import { BaseModel } from "src/app/shared/models/base-model";

export interface DriverModel extends BaseModel {
    id: string;
    driverId: string;
    name:string; 
    cubicCapacity:string; 
    stateNumber:string; 
    transportKindIds: [];
    transportTypeIds: [];
    loadingMethodIds: [];
    cargoTypeIds: [];
    refrigeratorFrom: string;
    refrigeratorTo: string;
    refrigeratorCount: string;
    isHook: string;
    isAdr: boolean,
    techPassportFrontFilePath:string; 
    techPassportBackFilePath:string; 
    transportFrontFilePath:string; 
    transportBackFilePath:string; 
    transportSideFilePath:string; 
    goodsTransportationLicenseCardFilePath:string; 
    driverLicenseFilePath:string; 
    passportFilePath:string; 
}