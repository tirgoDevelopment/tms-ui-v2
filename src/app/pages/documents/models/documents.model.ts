import { BaseModel } from "src/app/shared/models/base-model";

export interface DocumentModel extends BaseModel {
    id?: number;
    name: string;
    bucket: string;
    mimeType: string;
    size: string;
    docType: string;
    fileHash: string;
    driverId: number;
    driverName: string;
    transportId: number;
    transportNumber: string;
    description: string;
    createdAt: Date;
    createdBy: any;
    isDeleted: boolean;
    deletedAt: Date;
    deletedBy: any;
}