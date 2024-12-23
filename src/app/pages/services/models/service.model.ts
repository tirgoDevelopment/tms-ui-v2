
import { BaseModel } from "src/app/shared/models/base-model";

export interface ServiceModel extends BaseModel {
    name: string;
    code: number;
    kztAmount: string;
    uzsAmount: string;
    tirAmount: string;
    type: string;
    withoutSubscription: boolean;
    isLegalEntity: boolean;
}