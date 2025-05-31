import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, UserStorage } from "@/types/auth";

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	storage: UserStorage | null;
}

const initialState: AuthState = {
	user: null,
	token: localStorage.getItem("notes_token"),
	isAuthenticated: !!localStorage.getItem("notes_token"),
	isLoading: false,
	storage: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setCredentials: (
			state,
			action: PayloadAction<{ user: User; token: string }>
		) => {
			state.user = action.payload.user;
			state.token = action.payload.token;
			state.isAuthenticated = true;
			localStorage.setItem("notes_token", action.payload.token);
		},
		setUser: (state, action: PayloadAction<User>) => {
			state.user = action.payload;
		},
		setStorage: (state, action: PayloadAction<UserStorage>) => {
			state.storage = action.payload;
		},
		logout: (state) => {
			state.user = null;
			state.token = null;
			state.isAuthenticated = false;
			state.storage = null;
			localStorage.removeItem("notes_token");
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
	},
});

export const { setCredentials, setUser, setStorage, logout, setLoading } =
	authSlice.actions;
export default authSlice.reducer;
