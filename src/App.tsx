import React, { useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { store } from "./store/store";
import { theme } from "./theme/theme";
import { useAppSelector, useAppDispatch } from "./store/hook";
import { useGetMeQuery } from "./store/api/notesApi";
import { setUser, setStorage, logout } from "./store/slices/authSlice";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import NoteDetail from "./pages/notes/NoteDetail";
import Layout from "./components/layout/Layout";
import NotificationContainer from "./components/ui/NotificationContainer";

const AppContent: React.FC = () => {
	const { isAuthenticated, token } = useAppSelector((state) => state.auth);
	const dispatch = useAppDispatch();

	const { data: userData, error } = useGetMeQuery(undefined, {
		skip: !isAuthenticated || !token,
	});

	useEffect(() => {
		if (userData?.data) {
			dispatch(setUser(userData.data));
			dispatch(setStorage(userData.data.storage));
		}
	}, [userData, dispatch]);

	useEffect(() => {
		if (error && "status" in error && error.status === 401) {
			dispatch(logout());
		}
	}, [error, dispatch]);

	return (
		<Router>
			<Routes>
				{/* 公开路由 */}
				<Route
					path="/login"
					element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
				/>
				<Route
					path="/register"
					element={
						!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
					}
				/>

				{/* 需要认证的路由 */}
				<Route
					path="/dashboard"
					element={
						isAuthenticated ? (
							<Layout>
								<Dashboard />
							</Layout>
						) : (
							<Navigate to="/login" />
						)
					}
				/>

				{/* 笔记详情页面 - 全屏查看 */}
				<Route
					path="/notes/:id"
					element={isAuthenticated ? <NoteDetail /> : <Navigate to="/login" />}
				/>

				{/* 默认重定向 */}
				<Route
					path="/"
					element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
				/>
			</Routes>

			<NotificationContainer />
		</Router>
	);
};

function App() {
	return (
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<AppContent />
			</ThemeProvider>
		</Provider>
	);
}

export default App;
