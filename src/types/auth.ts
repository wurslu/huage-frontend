export interface User {
	id: number;
	username: string;
	email: string;
	avatar?: string;
	role: string;
	created_at: string;
	updated_at: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	username: string;
	email: string;
	password: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}

export interface UserStorage {
	used_space: number;
	max_space: number;
	file_count: number;
	image_count: number;
	document_count: number;
}
