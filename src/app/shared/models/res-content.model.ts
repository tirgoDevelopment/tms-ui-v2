export interface ResponseContent<T> {
    data?: {
        content: T;
        totalCount?: number;
        totalPagesCount?: number;
        totalElements?: number;
    };
    content?: T;
    success?: boolean;
    status?: boolean;
    totalCount?: number;
    totalPagesCount?: number;
    totalElements?: number;
    code?: number;
    error?: string;
}