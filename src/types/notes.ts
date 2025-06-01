import { Attachment } from "@/store/api/notesApi";

export interface Category {
	id: number;
	name: string;
	parent_id?: number;
	description?: string;
	note_count: number;
	children?: Category[];
	created_at: string;
	updated_at: string;
}

export interface Tag {
	id: number;
	name: string;
	color: string;
	note_count: number;
	created_at: string;
}

export interface Note {
	id: number;
	title: string;
	content: string;
	content_type: "markdown" | "html";
	is_public: boolean;
	view_count: number;
	user_id: number;
	category_id?: number;
	category?: Category;
	tags: Tag[];
	attachments: Attachment[];
	created_at: string;
	updated_at: string;
}

export interface CreateNoteRequest {
	title: string;
	content: string;
	content_type?: "markdown" | "html";
	category_id?: number;
	tag_ids?: number[];
	is_public?: boolean;
}

export interface UpdateNoteRequest extends CreateNoteRequest {}

export interface NotesListRequest {
	page?: number;
	limit?: number;
	category_id?: number;
	tag_id?: number;
	search?: string;
	sort?: string;
	order?: string;
}

export interface ShareLink {
	share_code: string;
	share_url: string;
	password?: string;
	expire_time?: string;
}

export interface CreateShareLinkRequest {
	password?: string;
	expire_time?: string;
}
