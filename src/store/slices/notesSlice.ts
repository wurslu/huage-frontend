import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Note } from "@/types/notes";

interface NotesState {
	notes: Note[];
	currentNote: Note | null;
	isLoading: boolean;
	searchQuery: string;
	selectedCategoryId: number | null;
	selectedTagId: number | null;
	currentPage: number;
	totalPages: number;
}

const initialState: NotesState = {
	notes: [],
	currentNote: null,
	isLoading: false,
	searchQuery: "",
	selectedCategoryId: null,
	selectedTagId: null,
	currentPage: 1,
	totalPages: 1,
};

const notesSlice = createSlice({
	name: "notes",
	initialState,
	reducers: {
		setNotes: (state, action: PayloadAction<Note[]>) => {
			state.notes = action.payload;
		},
		addNote: (state, action: PayloadAction<Note>) => {
			state.notes.unshift(action.payload);
		},
		updateNote: (state, action: PayloadAction<Note>) => {
			const index = state.notes.findIndex(
				(note) => note.id === action.payload.id
			);
			if (index !== -1) {
				state.notes[index] = action.payload;
			}
		},
		removeNote: (state, action: PayloadAction<number>) => {
			state.notes = state.notes.filter((note) => note.id !== action.payload);
		},
		setCurrentNote: (state, action: PayloadAction<Note | null>) => {
			state.currentNote = action.payload;
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setSearchQuery: (state, action: PayloadAction<string>) => {
			state.searchQuery = action.payload;
			state.currentPage = 1;
		},
		setSelectedCategory: (state, action: PayloadAction<number | null>) => {
			state.selectedCategoryId = action.payload;
			state.selectedTagId = null;
			state.currentPage = 1;
		},
		setSelectedTag: (state, action: PayloadAction<number | null>) => {
			state.selectedTagId = action.payload;
			state.selectedCategoryId = null;
			state.currentPage = 1;
		},
		setCurrentPage: (state, action: PayloadAction<number>) => {
			state.currentPage = action.payload;
		},
		setPagination: (
			state,
			action: PayloadAction<{ page: number; pages: number }>
		) => {
			state.currentPage = action.payload.page;
			state.totalPages = action.payload.pages;
		},
		clearFilters: (state) => {
			state.selectedCategoryId = null;
			state.selectedTagId = null;
			state.searchQuery = "";
			state.currentPage = 1;
		},
	},
});

export const {
	setNotes,
	addNote,
	updateNote,
	removeNote,
	setCurrentNote,
	setLoading,
	setSearchQuery,
	setSelectedCategory,
	setSelectedTag,
	setCurrentPage,
	setPagination,
	clearFilters,
} = notesSlice.actions;

export default notesSlice.reducer;
