import React from "react";
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

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotificationContainer from "./components/ui/NotificationContainer";

// 临时的仪表板组件
const Dashboard: React.FC = () => (
	<div style={{ padding: "20px" }}>
		<h1>Dashboard 页面（待实现）</h1>
		<p>登录成功！</p>
	</div>
);

const AppContent: React.FC = () => {
	// 暂时简化，先不加载用户信息
	const isAuthenticated = !!localStorage.getItem("notes_token");

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
					element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
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
