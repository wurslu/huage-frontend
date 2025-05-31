import { configureStore } from "@reduxjs/toolkit";
import { notesApi } from "./api/notesApi";
import authSlice from "./slices/authSlice";
import notesSlice from "./slices/notesSlice";
import uiSlice from "./slices/uiSlice";

export const store = configureStore({
	reducer: {
		auth: authSlice,
		notes: notesSlice,
		ui: uiSlice,
		[notesApi.reducerPath]: notesApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
			},
		}).concat(notesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
