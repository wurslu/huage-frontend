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
	tagTypes: ["Note", "Category", "Tag", "User"],
	endpoints: (builder) => ({
		// 认证相关
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

		// 笔记相关
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

		// 获取用户统计数据
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

		// 获取单个笔记的接口
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
			invalidatesTags: ["Note"],
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
			],
		}),

		deleteNote: builder.mutation<ApiResponse<void>, number>({
			query: (id) => ({
				url: `/notes/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Note"],
		}),

		// 分享相关
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
		}),

		// 分类相关
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
			invalidatesTags: ["Category"],
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

		// 标签相关
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
			invalidatesTags: ["Tag"],
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
} = notesApi;
