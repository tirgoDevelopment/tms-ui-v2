export interface Response<T> {
	data: T;
	content?: T;
	success?: boolean;
	status?: boolean;
	totalCount?: number;
	totalPagesCount?:number;
	totalElements?: number;
	code?: number;
	error?: string;
}