import { BaseModel } from "./base-model";
import { PermissionModel } from "./permission.model";

export interface RoleModel extends BaseModel {
    name: string;
    description: string;
    permission: PermissionModel;
}