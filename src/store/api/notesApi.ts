// src/store/api/notesApi.ts - 更新版本，添加分享相关API
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
	tagTypes: ["Note", "Category", "Tag", "User", "ShareLink"],
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
			invalidatesTags: ["Note", "Category", "Tag"],
		}),

		// 分享相关API
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
				"ShareLink",
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
		}),

		deleteShareLink: builder.mutation<ApiResponse<void>, number>({
			query: (noteId) => ({
				url: `/notes/${noteId}/share`,
				method: "DELETE",
			}),
			invalidatesTags: (result, error, noteId) => [
				{ type: "ShareLink", id: noteId },
				"ShareLink",
			],
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
	useGetCategoriesQuery,
	useCreateCategoryMutation,
	useUpdateCategoryMutation,
	useDeleteCategoryMutation,
	useGetTagsQuery,
	useCreateTagMutation,
	useUpdateTagMutation,
	useDeleteTagMutation,
	useCreateShareLinkMutation,
	useGetShareInfoQuery,
	useDeleteShareLinkMutation,
} = notesApi;
