import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { Note, NotesListRequest, Category, Tag } from "@/types/notes";
import {
	LoginRequest,
	RegisterRequest,
	AuthResponse,
	User,
	UserStorage,
} from "@/types/auth";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export interface Attachment {
	id: number;
	note_id: number;
	filename: string;
	original_filename: string;
	file_path: string;
	file_size: number;
	file_type: string;
	mime_type?: string;
	is_image: boolean;
	created_at: string;
	urls?: {
		original: string;
		medium?: string;
		thumbnail?: string;
	};
}

export interface FileUploadResponse {
	id: number;
	filename: string;
	original_filename: string;
	file_size: number;
	file_type: string;
	is_image: boolean;
	urls: {
		original: string;
	};
}

export const notesApi = createApi({
	reducerPath: "notesApi",
	baseQuery: fetchBaseQuery({
		baseUrl: "/api",
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth.token;
			if (token) {
				headers.set("authorization", `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: [
		"Note",
		"Category",
		"Tag",
		"User",
		"ShareLink",
		"Attachment",
		"Storage",
	],
	endpoints: (builder) => ({
		login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
			query: (credentials) => ({
				url: "/auth/login",
				method: "POST",
				body: credentials,
			}),
		}),
		register: builder.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
			query: (userData) => ({
				url: "/auth/register",
				method: "POST",
				body: userData,
			}),
		}),
		getMe: builder.query<ApiResponse<User & { storage: UserStorage }>, void>({
			query: () => "/auth/me",
			providesTags: ["User"],
		}),

		getNotes: builder.query<
			ApiResponse<PaginatedResponse<Note>>,
			NotesListRequest
		>({
			query: (params) => ({
				url: "/notes",
				params: {
					...params,
					limit: params.limit || 20,
					page: params.page || 1,
				},
			}),
			providesTags: ["Note"],
		}),

		getUserStats: builder.query<
			ApiResponse<{
				total_notes: number;
				public_notes: number;
				private_notes: number;
				total_categories: number;
				total_tags: number;
				total_views: number;
			}>,
			void
		>({
			query: () => "/notes/stats",
			providesTags: ["Note", "Category", "Tag"],
		}),

		getNoteById: builder.query<ApiResponse<Note>, number>({
			query: (id) => `/notes/${id}`,
			providesTags: (result, error, id) => [{ type: "Note", id }],
		}),

		createNote: builder.mutation<ApiResponse<Note>, Partial<Note>>({
			query: (noteData) => ({
				url: "/notes",
				method: "POST",
				body: noteData,
			}),
			invalidatesTags: ["Note", "Category", "Tag"],
		}),

		updateNote: builder.mutation<
			ApiResponse<Note>,
			{ id: number } & Partial<Note>
		>({
			query: ({ id, ...noteData }) => ({
				url: `/notes/${id}`,
				method: "PUT",
				body: noteData,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: "Note", id },
				"Note",
				"Category",
				"Tag",
			],
		}),

		deleteNote: builder.mutation<ApiResponse<void>, number>({
			query: (id) => ({
				url: `/notes/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Note", "Category", "Tag", "Attachment"],
		}),

		uploadFile: builder.mutation<
			ApiResponse<Attachment>,
			{ noteId: number; file: File }
		>({
			query: ({ noteId, file }) => {
				const formData = new FormData();
				formData.append("file", file);
				return {
					url: `/notes/${noteId}/attachments`,
					method: "POST",
					body: formData,
				};
			},
			invalidatesTags: (result, error, { noteId }) => [
				{ type: "Note", id: noteId },
				{ type: "Attachment", id: noteId },
				"Storage",
				"User",
			],
		}),

		getAttachments: builder.query<ApiResponse<Attachment[]>, number>({
			query: (noteId) => `/notes/${noteId}/attachments`,
			providesTags: (result, error, noteId) => [
				{ type: "Attachment", id: noteId },
			],
		}),

		deleteAttachment: builder.mutation<ApiResponse<void>, number>({
			query: (attachmentId) => ({
				url: `/attachments/${attachmentId}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Note", "Attachment", "Storage", "User"],
		}),

		getUserStorage: builder.query<ApiResponse<UserStorage>, void>({
			query: () => "/user/storage",
			providesTags: ["Storage"],
		}),

		createShareLink: builder.mutation<
			ApiResponse<{
				share_code: string;
				share_url: string;
				password?: string;
				expire_time?: string;
			}>,
			{
				noteId: number;
				password?: string;
				expire_time?: string;
			}
		>({
			query: ({ noteId, ...shareData }) => ({
				url: `/notes/${noteId}/share`,
				method: "POST",
				body: shareData,
			}),
			invalidatesTags: (result, error, { noteId }) => [
				{ type: "ShareLink", id: noteId },
				{ type: "ShareLink", id: "LIST" },
				{ type: "Note", id: noteId },
			],
		}),

		getShareInfo: builder.query<
			ApiResponse<{
				share_code: string;
				share_url: string;
				password?: string;
				expire_time?: string;
			}>,
			number
		>({
			query: (noteId) => `/notes/${noteId}/share`,
			providesTags: (result, error, noteId) => [
				{ type: "ShareLink", id: noteId },
			],
			keepUnusedDataFor: 0,
		}),

		deleteShareLink: builder.mutation<ApiResponse<void>, number>({
			query: (noteId) => ({
				url: `/notes/${noteId}/share`,
				method: "DELETE",
			}),
			invalidatesTags: (result, error, noteId) => [
				{ type: "ShareLink", id: noteId },
				{ type: "ShareLink", id: "LIST" },
				{ type: "Note", id: noteId },
			],
			async onQueryStarted(noteId, { dispatch, queryFulfilled }) {
				try {
					await queryFulfilled;
					dispatch(
						notesApi.util.updateQueryData("getShareInfo", noteId, (draft) => {
							return undefined;
						})
					);
				} catch (e) {
					console.log(e);
				}
			},
		}),

		getCategories: builder.query<ApiResponse<Category[]>, void>({
			query: () => "/categories",
			providesTags: ["Category"],
		}),

		createCategory: builder.mutation<ApiResponse<Category>, Partial<Category>>({
			query: (categoryData) => ({
				url: "/categories",
				method: "POST",
				body: categoryData,
			}),
			invalidatesTags: ["Category", "Note"],
		}),

		updateCategory: builder.mutation<
			ApiResponse<Category>,
			{ id: number } & Partial<Category>
		>({
			query: ({ id, ...categoryData }) => ({
				url: `/categories/${id}`,
				method: "PUT",
				body: categoryData,
			}),
			invalidatesTags: ["Category"],
		}),

		deleteCategory: builder.mutation<ApiResponse<void>, number>({
			query: (id) => ({
				url: `/categories/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Category"],
		}),

		getTags: builder.query<ApiResponse<Tag[]>, void>({
			query: () => "/tags",
			providesTags: ["Tag"],
		}),

		createTag: builder.mutation<ApiResponse<Tag>, Partial<Tag>>({
			query: (tagData) => ({
				url: "/tags",
				method: "POST",
				body: tagData,
			}),
			invalidatesTags: ["Tag", "Note"],
		}),

		updateTag: builder.mutation<
			ApiResponse<Tag>,
			{ id: number } & Partial<Tag>
		>({
			query: ({ id, ...tagData }) => ({
				url: `/tags/${id}`,
				method: "PUT",
				body: tagData,
			}),
			invalidatesTags: ["Tag"],
		}),

		deleteTag: builder.mutation<ApiResponse<void>, number>({
			query: (id) => ({
				url: `/tags/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Tag"],
		}),
	}),
});

export const {
	useLoginMutation,
	useRegisterMutation,
	useGetMeQuery,

	useGetNotesQuery,
	useGetUserStatsQuery,
	useGetNoteByIdQuery,
	useCreateNoteMutation,
	useUpdateNoteMutation,
	useDeleteNoteMutation,

	useUploadFileMutation,
	useGetAttachmentsQuery,
	useDeleteAttachmentMutation,
	useGetUserStorageQuery,

	useCreateShareLinkMutation,
	useGetShareInfoQuery,
	useDeleteShareLinkMutation,

	useGetCategoriesQuery,
	useCreateCategoryMutation,
	useUpdateCategoryMutation,
	useDeleteCategoryMutation,

	useGetTagsQuery,
	useCreateTagMutation,
	useUpdateTagMutation,
	useDeleteTagMutation,
} = notesApi;
