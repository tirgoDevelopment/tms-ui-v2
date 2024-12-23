import { BaseModel } from "./base-model";

export interface PermissionModel extends BaseModel {
	addDriver: boolean;
	addClient: boolean;
	addOrder: boolean;
	cancelOrder: boolean;
	seeDriversInfo: boolean;
	seeClientsInfo: boolean;
	sendPush: boolean;
	chat: boolean;
	tracking: boolean;
	driverFinance: boolean;
	merchantFinance: boolean;
	registrMerchant: boolean;
	verifyDriver: boolean;
	merchantList: boolean;
}