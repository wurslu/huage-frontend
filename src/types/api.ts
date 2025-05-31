export interface ApiResponse<T = any> {
	code: number;
	message: string;
	data?: T;
	errors?: any;
}

export interface Pagination {
	page: number;
	limit: number;
	total: number;
	pages: number;
}

export interface PaginatedResponse<T> {
	notes: T[];
	pagination: Pagination;
}
