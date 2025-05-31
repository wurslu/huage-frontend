import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
	isSidebarOpen: boolean;
	isNoteEditorOpen: boolean;
	editingNoteId: number | null;
	isShareModalOpen: boolean;
	sharingNoteId: number | null;
	notifications: Array<{
		id: string;
		type: "success" | "error" | "info" | "warning";
		message: string;
	}>;
}

const initialState: UiState = {
	isSidebarOpen: true,
	isNoteEditorOpen: false,
	editingNoteId: null,
	isShareModalOpen: false,
	sharingNoteId: null,
	notifications: [],
};

const uiSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		toggleSidebar: (state) => {
			state.isSidebarOpen = !state.isSidebarOpen;
		},
		setSidebarOpen: (state, action: PayloadAction<boolean>) => {
			state.isSidebarOpen = action.payload;
		},
		openNoteEditor: (state, action: PayloadAction<number | null>) => {
			state.isNoteEditorOpen = true;
			state.editingNoteId = action.payload;
		},
		closeNoteEditor: (state) => {
			state.isNoteEditorOpen = false;
			state.editingNoteId = null;
		},
		openShareModal: (state, action: PayloadAction<number>) => {
			state.isShareModalOpen = true;
			state.sharingNoteId = action.payload;
		},
		closeShareModal: (state) => {
			state.isShareModalOpen = false;
			state.sharingNoteId = null;
		},
		addNotification: (
			state,
			action: PayloadAction<{
				type: "success" | "error" | "info" | "warning";
				message: string;
			}>
		) => {
			const id = Date.now().toString();
			state.notifications.push({
				id,
				...action.payload,
			});
		},
		removeNotification: (state, action: PayloadAction<string>) => {
			state.notifications = state.notifications.filter(
				(n) => n.id !== action.payload
			);
		},
	},
});

export const {
	toggleSidebar,
	setSidebarOpen,
	openNoteEditor,
	closeNoteEditor,
	openShareModal,
	closeShareModal,
	addNotification,
	removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
