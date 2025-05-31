import React from "react";
import { Box, Toolbar } from "@mui/material";
import { useAppSelector } from "../../store/hook";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const { isSidebarOpen } = useAppSelector((state) => state.ui);

	return (
		<Box sx={{ display: "flex" }}>
			<Header />
			<Sidebar open={isSidebarOpen} />

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					transition: (theme) =>
						theme.transitions.create(["margin"], {
							easing: theme.transitions.easing.easeOut,
							duration: theme.transitions.duration.enteringScreen,
						}),
					ml: isSidebarOpen ? 0 : "-280px",
				}}
			>
				<Toolbar />
				<Box sx={{ p: 3 }}>{children}</Box>
			</Box>
		</Box>
	);
};

export default Layout;
